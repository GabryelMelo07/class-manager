package com.class_manager.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.class_manager.backend.dto.EmailAttachmentDto;
import com.class_manager.backend.dto.EmailDto;
import com.class_manager.backend.dto.RequestEmailDto;
import com.class_manager.backend.service.EmailService;
import com.class_manager.backend.utils.EmailTemplates;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
public class EmailController {

	private final EmailService emailService;

	@PostMapping(path = "/send-schedules-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<Void> sendEmailWithPdf(@Valid @ModelAttribute RequestEmailDto dto) throws MessagingException {
		MultipartFile file = dto.getSchedulesPdfAttachment();

		try {
			String fileName = file.getOriginalFilename();
			byte[] fileContent = file.getBytes();
			EmailAttachmentDto attachmentDto = new EmailAttachmentDto(fileName, fileContent);

			String body = EmailTemplates.getSchedulesTemplate(dto.getCourseName(), dto.getSemesterName());
			EmailDto emailDto = new EmailDto(dto.getTo(), dto.getSubject(), body, attachmentDto);
			emailService.sendEmailAsync(emailDto);
		} catch (Exception e) {
			log.error("Error sending email", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}

		return ResponseEntity.status(HttpStatus.OK).build();
	}

}
