package com.class_manager.backend.dto.model.group;

import com.class_manager.backend.decorators.ValidString;

import jakarta.validation.constraints.Positive;

public record GroupDto(
    @ValidString String name,
    @ValidString String abbreviation,
	@Positive Long disciplineId,
	@Positive Long classRoomId
) {
}
