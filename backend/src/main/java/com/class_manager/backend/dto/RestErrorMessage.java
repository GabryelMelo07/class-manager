package com.class_manager.backend.dto;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

public record RestErrorMessage(
		LocalDateTime timestamp,
		HttpStatus status,
		String error) {
}
