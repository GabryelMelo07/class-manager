package com.class_manager.backend.dto;

import com.class_manager.backend.utils.EmailAttachmentDto;

import io.micrometer.common.lang.Nullable;

public record EmailDto(
		String to,
		String subject,
		String body,
		@Nullable EmailAttachmentDto attachmentDto) {
}
