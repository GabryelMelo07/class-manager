package com.class_manager.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.EmailAttachmentDto;
import com.class_manager.backend.dto.EmailDto;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

	private final String from;
	private final JavaMailSender javaMailSender;

	EmailService(@Value("${spring.mail.username}") String from, JavaMailSender javaMailSender) {
		this.from = from;
		this.javaMailSender = javaMailSender;
	}

	@Async
	public void sendEmailAsync(EmailDto dto) throws MessagingException {
		MimeMessage message = javaMailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

		helper.setFrom(from);
		helper.setTo(dto.to().split("\\s*,\\s*"));
		helper.setSubject(dto.subject());
		helper.setText(dto.body(), true);

		String logoImagePath = "static/logo-horizontal-branco.png";
		Optional<ClassPathResource> optionalLogoImg = Optional.ofNullable(new ClassPathResource(logoImagePath));

		if (optionalLogoImg.isPresent()) {
			ClassPathResource logoImg = optionalLogoImg.get();
			helper.addInline("logoImage", logoImg);
		} else {
			log.warn("Logo image not found in classpath: {}", logoImagePath);
		}

		Optional<EmailAttachmentDto> optionalAttachmentDto = Optional.ofNullable(dto.attachmentDto());

		if (optionalAttachmentDto.isPresent()) {
			EmailAttachmentDto attachmentDto = optionalAttachmentDto.get();
			helper.addAttachment(
					attachmentDto.fileName(),
					new ByteArrayResource(attachmentDto.content(), "application/pdf"));
		}

		javaMailSender.send(message);
	}

}
