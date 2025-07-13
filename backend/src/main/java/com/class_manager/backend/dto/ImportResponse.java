package com.class_manager.backend.dto;

import java.util.List;

public record ImportResponse(
		String message,
		List<String> errors) {
}
