package com.class_manager.backend.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.dto.EmailDto;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    private final JavaMailSender javaMailSender;
    private final String from;

    EmailService(JavaMailSender javaMailSender, AppConfigProperties appConfigProperties) {
        this.javaMailSender = javaMailSender;
		this.from = appConfigProperties.emailConfig().username();
    }
    
    @Async
    public void sendEmailAsync(EmailDto dto) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(from);
        helper.setTo(dto.to());
        helper.setSubject(dto.subject());
        helper.setText(dto.body(), true);

        javaMailSender.send(message);
    }
    
}
