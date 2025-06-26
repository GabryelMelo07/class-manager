package com.class_manager.backend.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class JavaMailSenderConfig {

	private final String host;
	private final Integer port;
	private final String username;
	private final String password;
	private final Boolean smtpAuth;
	private final Boolean smtpStartTlsEnable;

	public JavaMailSenderConfig(
			@Value("${spring.mail.host}") String host,
			@Value("${spring.mail.port}") Integer port,
			@Value("${spring.mail.username}") String username,
			@Value("${spring.mail.password}") String password,
			@Value("${spring.mail.properties.mail.smtp.auth}") Boolean smtpAuth,
			@Value("${spring.mail.properties.mail.smtp.starttls.enable}") Boolean smtpStartTlsEnable) {
		this.host = host;
		this.port = port;
		this.username = username;
		this.password = password;
		this.smtpAuth = smtpAuth;
		this.smtpStartTlsEnable = smtpStartTlsEnable;
	}

	@Bean
	JavaMailSender javaMailSender() {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setHost(host);
		mailSender.setPort(port);
		mailSender.setUsername(username);
		mailSender.setPassword(password);

		Properties props = mailSender.getJavaMailProperties();
		props.put("mail.smtp.auth", String.valueOf(smtpAuth));
		props.put("mail.smtp.starttls.enable", String.valueOf(smtpStartTlsEnable));

		return mailSender;
	}

}
