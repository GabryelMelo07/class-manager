package com.class_manager.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.auth.UserResponseDto;
import com.class_manager.backend.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
	
	private final UserService userService;

	@GetMapping("/teachers")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Page<UserResponseDto>> findAllTeachers(Pageable pageable) {
		return ResponseEntity.ok(userService.findAllTeachers(pageable));
	}
	
	@GetMapping("/coordinators")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Page<UserResponseDto>> findAllCoordinators(Pageable pageable) {
		return ResponseEntity.ok(userService.findAllCoordinators(pageable));
	}

}
