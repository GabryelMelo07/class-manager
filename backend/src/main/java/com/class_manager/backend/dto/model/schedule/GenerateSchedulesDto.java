package com.class_manager.backend.dto.model.schedule;

import jakarta.validation.constraints.Positive;

public record GenerateSchedulesDto(
		@Positive Long courseId,
		@Positive Long semesterId) {
}
