package com.class_manager.backend.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import org.springframework.core.env.Environment;

import com.class_manager.backend.dto.AppConfigProperties;

public class AppConfigLoaderTest {
	@Test
    void shouldLoadDevConfigFileWhenProfileIsDev() throws Exception {
        Environment mockEnv = mock(Environment.class);
        when(mockEnv.getProperty("spring.profiles.active")).thenReturn("dev");

        AppConfigLoader loader = new AppConfigLoader(mockEnv);
        AppConfigProperties properties = loader.injectAppConfigProperties();

        assertNotNull(properties);
    }

    @Test
    void shouldLoadProdConfigFileWhenProfileIsNotDev() throws Exception {
        Environment mockEnv = mock(Environment.class);
        when(mockEnv.getProperty("spring.profiles.active")).thenReturn("prod");

        AppConfigLoader loader = new AppConfigLoader(mockEnv);
        AppConfigProperties properties = loader.injectAppConfigProperties();

        assertNotNull(properties);
    }
}
