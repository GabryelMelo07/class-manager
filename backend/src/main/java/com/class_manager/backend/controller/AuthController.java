package com.class_manager.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.auth.CreateTeacherDto;
import com.class_manager.backend.dto.auth.CreateUserDto;
import com.class_manager.backend.dto.auth.LoginRequestDto;
import com.class_manager.backend.dto.auth.LoginResponseDto;
import com.class_manager.backend.dto.auth.RefreshTokenRequestDto;
import com.class_manager.backend.dto.auth.ResetPasswordDto;
import com.class_manager.backend.dto.auth.UserResponseDto;
import com.class_manager.backend.service.UserService;
import com.class_manager.backend.utils.api_responses_examples.AuthResponses;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@Operation(summary = "Cadastrar novo usuário", description = "Este recurso só pode ser usado por usuários administradores e realiza o cadastro de um novo usuário")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "422", description = "Já existe um usuário com este e-mail no banco de dados", content = @Content(mediaType = "application/json")),
	})
	@Transactional
	@PostMapping("/register")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> registerUser(@RequestBody CreateUserDto dto) {
		userService.registerUser(dto);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@Operation(summary = "Cadastrar novo professor", description = "Este recurso só pode ser usado por usuários administradores e realiza o cadastro de um novo professor")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "422", description = "Já existe um professor com este e-mail no banco de dados", content = @Content(mediaType = "application/json")),
	})
	@Transactional
	@PostMapping("/register-teacher")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> registerTeacher(@RequestBody CreateTeacherDto dto) {
		userService.registerTeacher(dto);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@Operation(summary = "Listar usuários", description = "Este recurso só pode ser usado por usuários administradores e lista todos usuários cadastrados no banco de dados")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Success", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = AuthResponses.LISTAR_USUARIOS)))
	})
	@GetMapping("/users")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<List<UserResponseDto>> listUsers() {
		return ResponseEntity.ok(userService.findAll());
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
		return ResponseEntity.ok(userService.login(loginRequest));
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
		userService.requestPasswordResetAndSendEmail(email);
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
		userService.resetPassword(token, dto);
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
		return ResponseEntity.ok(userService.refreshToken(dto));
	}

}
