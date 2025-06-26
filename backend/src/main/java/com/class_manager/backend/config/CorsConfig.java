package com.class_manager.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private final String allowedOrigins;
	private final String allowedMethods;
	private final String allowedHeaders;

	public CorsConfig(
			@Value("${cors.allowed.origins}") String allowedOrigins,
			@Value("${cors.allowed.methods}") String allowedMethods,
			@Value("${cors.allowed.headers}") String allowedHeaders) {
		this.allowedOrigins = allowedOrigins;
		this.allowedMethods = allowedMethods;
		this.allowedHeaders = allowedHeaders;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins(safeSplit(allowedOrigins))
				.allowedMethods(safeSplit(allowedMethods))
				.allowedHeaders(safeSplit(allowedHeaders));
	}

	private String[] safeSplit(String value) {
		return value != null && !value.trim().isEmpty() ? value.split(",") : new String[0];
	}
}
