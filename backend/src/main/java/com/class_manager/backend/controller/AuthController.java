package com.class_manager.backend.controller;

import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.dto.EmailDto;
import com.class_manager.backend.dto.UserResponseDto;
import com.class_manager.backend.dto.auth.CreateUserDto;
import com.class_manager.backend.dto.auth.LoginRequestDto;
import com.class_manager.backend.dto.auth.LoginResponseDto;
import com.class_manager.backend.dto.auth.RefreshTokenRequestDto;
import com.class_manager.backend.dto.auth.ResetPasswordDto;
import com.class_manager.backend.exceptions.JwtTokenValidationException;
import com.class_manager.backend.exceptions.ResetPasswordTokenInvalidException;
import com.class_manager.backend.model.PasswordResetToken;
import com.class_manager.backend.model.Role;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.PasswordResetTokenRepository;
import com.class_manager.backend.repository.RoleRepository;
import com.class_manager.backend.repository.UserRepository;
import com.class_manager.backend.service.EmailService;
import com.class_manager.backend.utils.EmailTemplate;
import com.class_manager.backend.utils.JwtUtils;
import com.class_manager.backend.utils.api_responses_examples.AuthResponses;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

	private final JwtUtils jwtUtils;
	private final JwtDecoder jwtDecoder;
	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final AppConfigProperties appConfigProperties;

	@Value("${jwt.public.key}")
	private RSAPublicKey publicKey;

	@Value("${api.url}")
	private String issuer;

	@Value("${front-end.url}")
	private String frontEndUrl;

	public AuthController(
			JwtUtils jwtUtils,
			JwtDecoder jwtDecoder,
			UserRepository userRepository,
			RoleRepository roleRepository,
			PasswordResetTokenRepository passwordResetTokenRepository,
			BCryptPasswordEncoder passwordEncoder,
			EmailService emailService,
			AppConfigProperties appConfigProperties) {
		this.jwtUtils = jwtUtils;
		this.jwtDecoder = jwtDecoder;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.roleRepository = roleRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.emailService = emailService;
		this.appConfigProperties = appConfigProperties;
	}

	@Operation(summary = "Cadastrar novo usuário", description = "Este recurso só pode ser usado por usuários administradores e realiza o cadastro de um novo usuário")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "Usuário cadastrado com sucesso", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "422", description = "Já existe um usuário com este e-mail no banco de dados", content = @Content(mediaType = "application/json")),
	})
	@Transactional
	@PostMapping("/register")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> register(@RequestBody CreateUserDto dto) {
		var user = userRepository.findByEmail(dto.email());

		if (user.isPresent())
			throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
					"Já existe um usuário com este e-mail no banco de dados");

		Set<Role> roles = new HashSet<>();

		for (String roleStr : dto.roles()) {
			var role = roleRepository.findByNameIgnoreCase(roleStr);

			if (role != null)
				roles.add(role);
		}

		var newUser = new User(dto.email(), passwordEncoder.encode(dto.password()), dto.name(),
				dto.surname(), roles);

		userRepository.save(newUser);
		return ResponseEntity.status(201).build();
	}

	@Operation(summary = "Listar usuários", description = "Este recurso só pode ser usado por usuários administradores e lista todos usuários cadastrados no banco de dados")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.LISTAR_USUARIOS)))
	})
	@GetMapping("/users")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<List<UserResponseDto>> listUsers() {
		var usersFromDb = userRepository.findAll();
		var users = new ArrayList<UserResponseDto>();

		for (User user : usersFromDb) {
			users.add(new UserResponseDto(user.getId(), user.getEmail(), user.getName(),
					user.getSurname(), user.getRoles()));
		}

		return ResponseEntity.ok(users);
	}

	@Operation(summary = "Logar usuário", description = "Este recurso realiza o login de um usuário devolvendo 2 tokens, um de acesso e outro para pegar outro token quando o de acesso expirar")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.LOGIN_SUCESSO))),
			@ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.LOGIN_FALHA))),
			@ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(mediaType = "application/json"))
	})
	@PostMapping("/login")
	public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequest) {
		var user = userRepository.findByEmail(loginRequest.email());

		if (user.isEmpty() || !user.get().isPasswordCorrect(loginRequest.password(), passwordEncoder))
			throw new BadCredentialsException("Email ou senha inválidos.");

		User usuario = user.get();
		String userId = usuario.getId().toString();

		var accessToken = jwtUtils.buildJwtAccessToken(issuer, userId, usuario);
		var refreshToken = jwtUtils.buildJwtAccessToken(issuer, userId, usuario);

		return ResponseEntity.ok(new LoginResponseDto(accessToken, refreshToken));
	}

	@Operation(summary = "Solicitar troca de senha", description = "Este recurso cria uma solicitação de troca de senha e envia para o e-mail do usuário um link com um token no parâmetro da URL (Query Param), para identificar e validar a troca de senha")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.RESET_PASSWORD_USER_NOT_FOUND))),
			@ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(mediaType = "application/json"))
	})
	@PostMapping("/reset-password/request")
	public ResponseEntity<Void> resetPasswordRequest(@RequestParam @Email String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

		Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);
		String operationToken = UUID.randomUUID().toString();
		String token = operationToken + "_" + expiresAt.toString();

		String resetPassUrl = String.format("%s/reset-password?token=%s", frontEndUrl, token);
		String institutionName = appConfigProperties.institutionProperties().name();
		String body = new EmailTemplate(appConfigProperties.emailTemplateProperties(), institutionName).getResetPasswordTemplate(user.getName(), resetPassUrl);

		try {
			String emailSubject = "Solicitação de redefinição de senha - %s".formatted(institutionName);
			emailService.sendEmailAsync(
					new EmailDto(email, emailSubject, body));
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}

		return ResponseEntity.ok().build();
	}

	@Operation(summary = "Redefinir senha", description = "Este recurso redefine a senha do usuário a partir de um token previamente gerado por ele")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "404", description = "Not Found - Usuário não encontrado com o username: admin", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.RESET_PASSWORD_USER_NOT_FOUND))),
			@ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(mediaType = "application/json"))
	})
	@PostMapping("/reset-password")
	public ResponseEntity<Void> resetPassword(@RequestParam String token, @RequestBody @Valid ResetPasswordDto dto) {
		PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(token)
				.orElseThrow(() -> new ResetPasswordTokenInvalidException());
		
		User user = passwordResetToken.getUser();

		user.setPassword(passwordEncoder.encode(dto.newPassword()));
		userRepository.save(user);
		
		passwordResetTokenRepository.delete(passwordResetToken);

		return ResponseEntity.ok().build();
	}

	@Operation(summary = "Atualizar token de acesso", description = "Este recurso renova o 'access_token' e o 'refresh_token' permitindo que o usuário fique logado por mais tempo na aplicação")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Tokens renovados com sucesso", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.LOGIN_SUCESSO))),
			@ApiResponse(responseCode = "400", description = "Bad Request", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(mediaType = "application/json"))
	})
	@PostMapping("/refresh-token")
	public ResponseEntity<LoginResponseDto> refreshToken(@RequestBody @Valid RefreshTokenRequestDto dto) {
		Jwt accessToken = jwtDecoder.decode(dto.accessToken());
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

		var newAccessToken = jwtUtils.buildJwtAccessToken(issuer, userId, usuario);
		var newRefreshToken = jwtUtils.buildJwtAccessToken(issuer, userId, usuario);
		return ResponseEntity.ok(new LoginResponseDto(newAccessToken, newRefreshToken));
	}

}
