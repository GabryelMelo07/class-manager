package com.class_manager.backend.dto.config_properties;

public record Cors(
	String[] allowedOrigins,
	String[] allowedMethods,
	String[] allowedHeaders
) {
}
