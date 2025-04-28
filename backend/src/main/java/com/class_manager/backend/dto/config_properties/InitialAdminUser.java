package com.class_manager.backend.dto.config_properties;

public record InitialAdminUser(
	String email,
	String password,
	String name,
	String surname
) {
}
