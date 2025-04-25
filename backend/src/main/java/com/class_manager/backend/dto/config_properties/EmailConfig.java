package com.class_manager.backend.dto.config_properties;

public record EmailConfig(
	String host,
	Integer port,
	String username,
	String password,
	Boolean smtpAuth,
	Boolean smtpStartTlsEnable
) {
}
