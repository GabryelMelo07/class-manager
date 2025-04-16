package com.class_manager.backend.dto.config_properties;

public record ApiProperties(
	String url,
	String title,
	String version,
	String description,
	String termsOfService
) {
}
