package com.class_manager.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.dto.config_properties.Cors;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private final Cors corsProperties;

	public CorsConfig(AppConfigProperties appConfigProperties) {
		this.corsProperties = appConfigProperties.cors();
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins(corsProperties.allowedOrigins())
				.allowedMethods(corsProperties.allowedMethods())
				.allowedHeaders(corsProperties.allowedHeaders());
	}
}
