package com.class_manager.backend.dto;

import com.class_manager.backend.dto.config_properties.Api;
import com.class_manager.backend.dto.config_properties.Cors;
import com.class_manager.backend.dto.config_properties.EmailConfig;
import com.class_manager.backend.dto.config_properties.EmailTemplateProperties;
import com.class_manager.backend.dto.config_properties.Frontend;
import com.class_manager.backend.dto.config_properties.InitialAdminUser;
import com.class_manager.backend.dto.config_properties.Institution;

/**
 * Main configuration object
 * Other configuration properties can be added in the config_properties folder
 */
public record AppConfigProperties(
	Institution institution,
	Api api,
	Frontend frontend,
	Cors cors,
	Boolean swaggerTryItOutDisabled,
	EmailConfig emailConfig,
	EmailTemplateProperties emailTemplateProperties,
	InitialAdminUser initialAdminUser
) {
}
