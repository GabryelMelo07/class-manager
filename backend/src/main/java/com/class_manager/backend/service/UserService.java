package com.class_manager.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.class_manager.backend.dto.EmailDto;
import com.class_manager.backend.dto.auth.CreateUserDto;
import com.class_manager.backend.dto.auth.LoginRequestDto;
import com.class_manager.backend.dto.auth.LoginResponseDto;
import com.class_manager.backend.dto.auth.RefreshTokenRequestDto;
import com.class_manager.backend.dto.auth.ResetPasswordDto;
import com.class_manager.backend.dto.auth.UpdateUserDto;
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
import com.class_manager.backend.utils.EmailTemplates;
import com.class_manager.backend.utils.JwtUtils;
import com.class_manager.backend.utils.Patcher;

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

	private final String apiIssuer;
	private final String frontEndUrl;

	public UserService(
			JwtUtils jwtUtils,
			JwtDecoder jwtDecoder,
			@Qualifier("noExpiresAtValidatorJwtDecoder") JwtDecoder noExpiresAtValidatorJwtDecoder,
			BCryptPasswordEncoder passwordEncoder,
			UserRepository userRepository,
			RoleRepository roleRepository,
			PasswordResetTokenRepository passwordResetTokenRepository,
			EmailService emailService,
			@Value("${api.issuer}") String apiIssuer,
			@Value("${front-end.url}") String frontEndUrl) {
		this.jwtUtils = jwtUtils;
		this.jwtDecoder = jwtDecoder;
		this.noExpiresAtValidatorJwtDecoder = noExpiresAtValidatorJwtDecoder;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.roleRepository = roleRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.emailService = emailService;
		this.apiIssuer = apiIssuer;
		this.frontEndUrl = frontEndUrl;
	}

	@Transactional
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

		var accessToken = jwtUtils.buildJwtAccessToken(apiIssuer, userId, Instant.now().plus(1, ChronoUnit.HOURS),
				usuario);
		var refreshToken = jwtUtils.buildJwtAccessToken(apiIssuer, userId, Instant.now().plus(3, ChronoUnit.DAYS),
				usuario);

		return new LoginResponseDto(accessToken, refreshToken);
	}

	public void requestPasswordResetAndSendEmail(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

		Optional<PasswordResetToken> passwordResetToken = passwordResetTokenRepository.findByUserId(user.getId());

		if (passwordResetToken.isPresent()) {
			passwordResetTokenRepository.delete(passwordResetToken.get());
		}

		Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);
		String operationToken = UUID.randomUUID().toString();
		String token = operationToken + "_" + expiresAt.toString();

		passwordResetTokenRepository.save(new PasswordResetToken(token, expiresAt, user));

		String resetPassUrl = String.format("%s/reset-password?token=%s", frontEndUrl, token);
		String body = EmailTemplates.getResetPasswordTemplate(user.getName(), resetPassUrl);

		try {
			String emailSubject = "Solicitação de redefinição de senha - Class Manager";
			emailService.sendEmailAsync(
					new EmailDto(email, emailSubject, body, null));
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
		Jwt accessToken = noExpiresAtValidatorJwtDecoder.decode(dto.accessToken()); // Decode without expiration
																					// validation
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

		var newAccessToken = jwtUtils.buildJwtAccessToken(apiIssuer, userId, Instant.now().plus(1, ChronoUnit.HOURS),
				usuario);
		var newRefreshToken = jwtUtils.buildJwtAccessToken(apiIssuer, userId, Instant.now().plus(3, ChronoUnit.DAYS),
				usuario);
		return new LoginResponseDto(newAccessToken, newRefreshToken);
	}

	public void patch(UUID userId, UpdateUserDto userDto) {
		User partialUser = new User(userDto);

		User existingUser = userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("User not found."));

		if (!userDto.roles().isEmpty()) {
			Set<Role> roles = new HashSet<>();

			for (RoleName roleName : userDto.roles()) {
				var role = roleRepository.findByName(roleName);

				if (role.isPresent())
					roles.add(role.get());
			}

			partialUser.setRoles(roles);
		}

		try {
			Patcher.patch(existingUser, partialUser);
			userRepository.save(existingUser);
		} catch (Exception e) {
			throw new RuntimeException("Failed to patch User", e);
		}
	}

	public void deleteSoft(UUID userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException("User not found."));

		user.setActive(false);
		userRepository.save(user);
	}

}
