package com.class_manager.backend.dto.config_properties;

public record EmailTemplateProperties(
	String bodyBackground,
	String headerBackground,
	String footerBackground,
	String bodyFont,
	String headerFont,
	String buttonFont,
	String footerFont
) {
}
