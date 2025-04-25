package com.class_manager.backend.config;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.dto.config_properties.EmailConfig;

@Configuration
public class JavaMailSenderConfig {

	private final AppConfigProperties appConfigProperties;

	public JavaMailSenderConfig(AppConfigProperties appConfigProperties) {
		this.appConfigProperties = appConfigProperties;
	}

	@Bean
    JavaMailSender javaMailSender() {
		EmailConfig config = appConfigProperties.emailConfig();
		
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.host());
        mailSender.setPort(config.port());
        mailSender.setUsername(config.username());
        mailSender.setPassword(config.password());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", String.valueOf(config.smtpAuth()));
        props.put("mail.smtp.starttls.enable", String.valueOf(config.smtpStartTlsEnable()));

        return mailSender;
    }
	
}
