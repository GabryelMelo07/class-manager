package com.class_manager.backend.config;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.exceptions.AppPropertiesConfigException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Configuration
public class AppConfigLoader {

	private final Environment environment;

	public AppConfigLoader(Environment environment) {
		this.environment = environment;
	}

	private boolean isDev() {
		String activeProfile = environment.getProperty("spring.profiles.active");
		return "dev".equalsIgnoreCase(activeProfile);
	}

    @Bean
    AppConfigProperties injectAppConfigProperties() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // InputStream inputStream = getClass().getClassLoader().getResourceAsStream("app_settings.json");
			ClassPathResource configFile = isDev() ? new ClassPathResource("app_settings_dev.json") : new ClassPathResource("app_settings.json");
			InputStream inputStream = configFile.getInputStream();
            return mapper.readValue(inputStream, AppConfigProperties.class);
        } catch (Exception e) {
            throw new AppPropertiesConfigException(e);
        }
    }
}
