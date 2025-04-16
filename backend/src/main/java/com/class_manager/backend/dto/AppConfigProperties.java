package com.class_manager.backend.dto;

import com.class_manager.backend.dto.config_properties.ApiProperties;
import com.class_manager.backend.dto.config_properties.CorsProperties;
import com.class_manager.backend.dto.config_properties.EmailConfigProperties;
import com.class_manager.backend.dto.config_properties.EmailTemplateProperties;
import com.class_manager.backend.dto.config_properties.InstitutionProperties;

/**
 * Main configuration object
 * Other configuration properties can be added in the config_properties folder
 */
public record AppConfigProperties(
	ApiProperties apiProperties,
	EmailConfigProperties emailConfigProperties,
	EmailTemplateProperties emailTemplateProperties,
	InstitutionProperties institutionProperties,
	CorsProperties corsProperties,
	Boolean swaggerTryItOutDisabled
) {
}
