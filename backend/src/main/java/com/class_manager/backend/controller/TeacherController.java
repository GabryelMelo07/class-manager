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
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.auth.CreateTeacherDto;
import com.class_manager.backend.dto.model.teacher.TeacherResponseDto;
import com.class_manager.backend.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/teachers")
public class TeacherController {

	private final UserService userService;

	public TeacherController(UserService userService) {
		this.userService = userService;
	}
	
	@GetMapping
    public ResponseEntity<List<TeacherResponseDto>> findAll() {
        return ResponseEntity.ok(userService.findAllTeachers());
    }
	
	@Operation(summary = "Cadastrar novo professor", description = "Este recurso só pode ser usado por usuários administradores e realiza o cadastro de um novo professor")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", content = @Content(mediaType = "application/json")),
			@ApiResponse(responseCode = "422", description = "Já existe um professor com este e-mail no banco de dados", content = @Content(mediaType = "application/json")),
	})
	@Transactional
	@PostMapping("/register")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> registerTeacher(@RequestBody CreateTeacherDto dto) {
		userService.registerTeacher(dto);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}
	
}
