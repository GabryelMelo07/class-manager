package com.class_manager.backend.dto;

import io.micrometer.common.lang.Nullable;

public record EmailDto(
		String to,
		String subject,
		String body,
		@Nullable EmailAttachmentDto attachmentDto) {
}
