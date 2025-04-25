package com.class_manager.backend.dto.model.discipline;

import java.util.UUID;

public record DisciplineDto(
	String name,
	String abbreviation,
	UUID teacherId
) {
}
