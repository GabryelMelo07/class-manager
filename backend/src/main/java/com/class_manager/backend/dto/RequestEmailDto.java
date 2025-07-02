package com.class_manager.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.web.multipart.MultipartFile;

import com.class_manager.backend.decorators.ValidString;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class RequestEmailDto {
	@ValidString
	private String to;

	@ValidString
	private String subject;

	@ValidString
	private String courseName;

	@ValidString
	private String semesterName;

	@NotNull
	private MultipartFile schedulesPdfAttachment;

	public RequestEmailDto(String to, String subject) {
		this.to = to;
		this.subject = subject;
	}
}
