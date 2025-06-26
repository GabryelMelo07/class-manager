package com.class_manager.backend.dto.model.schedule;

import jakarta.validation.constraints.Positive;

public record CopySchedulesDto(
		@Positive Long fromSemesterId,
		@Positive Long toSemesterId,
		@Positive Long courseId) {
}
