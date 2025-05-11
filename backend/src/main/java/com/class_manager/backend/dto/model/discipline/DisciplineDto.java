package com.class_manager.backend.dto.model.discipline;

import java.util.UUID;

import com.class_manager.backend.decorators.ValidString;

import jakarta.validation.constraints.Positive;

public record DisciplineDto(
	@ValidString String name,
	@ValidString String abbreviation,
	@Positive Long courseId,
	UUID teacherId
) {
}
