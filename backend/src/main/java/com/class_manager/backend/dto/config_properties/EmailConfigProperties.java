package com.class_manager.backend.dto.config_properties;

public record EmailConfigProperties(
	String host,
	String port,
	String username,
	String password,
	Boolean smtpAuth,
	Boolean smtpStartTlsEnable
) {
}
