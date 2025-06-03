package com.class_manager.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.dto.EmailDto;
import com.class_manager.backend.dto.auth.CreateUserDto;
import com.class_manager.backend.dto.auth.LoginRequestDto;
import com.class_manager.backend.dto.auth.LoginResponseDto;
import com.class_manager.backend.dto.auth.RefreshTokenRequestDto;
import com.class_manager.backend.dto.auth.ResetPasswordDto;
import com.class_manager.backend.dto.auth.UserResponseDto;
import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.exceptions.JwtTokenValidationException;
import com.class_manager.backend.exceptions.ResetPasswordTokenInvalidException;
import com.class_manager.backend.model.PasswordResetToken;
import com.class_manager.backend.model.Role;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.PasswordResetTokenRepository;
import com.class_manager.backend.repository.RoleRepository;
import com.class_manager.backend.repository.UserRepository;
import com.class_manager.backend.utils.EmailTemplate;
import com.class_manager.backend.utils.JwtUtils;

import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserService {

	private final JwtUtils jwtUtils;
	private final JwtDecoder jwtDecoder;
	private final JwtDecoder noExpiresAtValidatorJwtDecoder;
	private final BCryptPasswordEncoder passwordEncoder;

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final EmailService emailService;

	private final String issuer;
	private final String frontEndUrl;
	private final AppConfigProperties appConfigProperties;

	public UserService(
			JwtUtils jwtUtils,
			JwtDecoder jwtDecoder,
			@Qualifier("noExpiresAtValidatorJwtDecoder") JwtDecoder noExpiresAtValidatorJwtDecoder,
			BCryptPasswordEncoder passwordEncoder,
			UserRepository userRepository,
			RoleRepository roleRepository,
			PasswordResetTokenRepository passwordResetTokenRepository,
			EmailService emailService,
			AppConfigProperties appConfigProperties) {
		this.jwtUtils = jwtUtils;
		this.jwtDecoder = jwtDecoder;
		this.noExpiresAtValidatorJwtDecoder = noExpiresAtValidatorJwtDecoder;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.roleRepository = roleRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.emailService = emailService;
		this.appConfigProperties = appConfigProperties;
		this.issuer = this.appConfigProperties.api().url();
		this.frontEndUrl = this.appConfigProperties.frontend().url();
	}

	public void register(CreateUserDto dto) {
		var existentUser = userRepository.findByEmail(dto.email());

		if (existentUser.isPresent()) {
			throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
					"Já existe um usuário com este e-mail no banco de dados");
		}

		Set<Role> roles = new HashSet<>();

		for (RoleName roleName : dto.roles()) {
			var role = roleRepository.findByName(roleName);

			if (role.isPresent())
				roles.add(role.get());
		}

		var user = new User(dto.email(), passwordEncoder.encode(dto.password()), dto.name(),
				dto.surname(), roles);

		userRepository.save(user);
	}

	public List<UserResponseDto> findAll() {
		List<UserResponseDto> users = new ArrayList<>();

		for (User user : userRepository.findAll()) {
			users.add(new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getSurname(),
					user.getRoles()));
		}

		return users;
	}

	private Page<UserResponseDto> findUsers(RoleName roleName, Pageable pageable) {
		return userRepository.findByRole(roleName, pageable)
				.map(user -> new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getSurname(),
						user.getRoles()));
	}

	public Page<UserResponseDto> findAllTeachers(Pageable pageable) {
		return findUsers(RoleName.TEACHER, pageable);
	}

	public Page<UserResponseDto> findAllCoordinators(Pageable pageable) {
		return findUsers(RoleName.COORDINATOR, pageable);
	}

	public LoginResponseDto login(LoginRequestDto loginRequest) {
		var user = userRepository.findByEmail(loginRequest.email());

		if (user.isEmpty() || !user.get().isPasswordCorrect(loginRequest.password(), passwordEncoder)) {
			throw new BadCredentialsException("Email ou senha inválidos.");
		}

		User usuario = user.get();
		String userId = usuario.getId().toString();

		var accessToken = jwtUtils.buildJwtAccessToken(issuer, userId, Instant.now().plus(1, ChronoUnit.HOURS), usuario);
		var refreshToken = jwtUtils.buildJwtAccessToken(issuer, userId, Instant.now().plus(3, ChronoUnit.DAYS), usuario);

		return new LoginResponseDto(accessToken, refreshToken);
	}

	public void requestPasswordResetAndSendEmail(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

		Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);
		String operationToken = UUID.randomUUID().toString();
		String token = operationToken + "_" + expiresAt.toString();

		String resetPassUrl = String.format("%s/reset-password?token=%s", frontEndUrl, token);
		String institutionName = appConfigProperties.institution().name();
		String body = new EmailTemplate(appConfigProperties.emailTemplateProperties(), institutionName)
				.getResetPasswordTemplate(user.getName(), resetPassUrl);

		try {
			String emailSubject = "Solicitação de redefinição de senha - %s".formatted(institutionName);
			emailService.sendEmailAsync(
					new EmailDto(email, emailSubject, body));
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}

	public void resetPassword(String token, ResetPasswordDto dto) {
		PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
				.orElseThrow(() -> new ResetPasswordTokenInvalidException());

		User user = passwordResetToken.getUser();

		user.setPassword(passwordEncoder.encode(dto.newPassword()));
		userRepository.save(user);

		passwordResetTokenRepository.delete(passwordResetToken);
	}

	public LoginResponseDto refreshToken(RefreshTokenRequestDto dto) {
		Jwt accessToken = noExpiresAtValidatorJwtDecoder.decode(dto.accessToken()); // Decode without expiration validation
		Jwt refreshToken = jwtDecoder.decode(dto.refreshToken());

		if (!refreshToken.getIssuer().equals(accessToken.getIssuer()))
			throw new JwtTokenValidationException("Erro ao validar refresh token: Issuer diferente.");
		if (!refreshToken.getSubject().equals(accessToken.getSubject()))
			throw new JwtTokenValidationException("Erro ao validar refresh token: Subject diferente.");
		if (!refreshToken.getIssuedAt().equals(accessToken.getIssuedAt()))
			throw new JwtTokenValidationException("Erro ao validar refresh token: Issued at diferente.");

		User usuario = userRepository.findById(UUID.fromString(accessToken.getSubject()))
				.orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado."));
		String userId = usuario.getId().toString();

		var newAccessToken = jwtUtils.buildJwtAccessToken(issuer, userId, Instant.now().plus(1, ChronoUnit.HOURS), usuario);
		var newRefreshToken = jwtUtils.buildJwtAccessToken(issuer, userId, Instant.now().plus(3, ChronoUnit.DAYS), usuario);
		return new LoginResponseDto(newAccessToken, newRefreshToken);
	}

}
