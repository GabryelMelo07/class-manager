package com.class_manager.backend.dto.model.discipline;

import com.class_manager.backend.decorators.ValidString;

import jakarta.validation.constraints.Positive;

public record ImportDisciplineDto(
	@ValidString String name,
	@ValidString String abbreviation,
	@Positive Integer credits,
	@ValidString String courseName,
	@ValidString String teacherEmail
) {
}
