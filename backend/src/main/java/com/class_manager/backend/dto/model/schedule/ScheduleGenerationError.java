package com.class_manager.backend.dto.model.schedule;

public record ScheduleGenerationError(
		Long groupId,
		String groupName,
		String message) {
}
