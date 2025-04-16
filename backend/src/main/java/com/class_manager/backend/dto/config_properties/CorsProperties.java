package com.class_manager.backend.dto.config_properties;

public record CorsProperties(
	String[] allowedOrigins,
	String[] allowedMethods,
	String[] allowedHeaders
) {
}
