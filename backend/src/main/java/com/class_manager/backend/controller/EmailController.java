package com.class_manager.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.EmailDto;
import com.class_manager.backend.service.EmailService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
public class EmailController {

	private final EmailService emailService;

	@PostMapping("/register")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<Void> sendEmail(@RequestBody EmailDto dto) throws MessagingException {
		emailService.sendEmailAsync(dto);
		return ResponseEntity.status(HttpStatus.OK).build();
	}

}
