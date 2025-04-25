package com.class_manager.backend.dto.model.group;

public record GroupDto(
    String name,
    String abbreviation,
	Long disciplineId,
	Long classRoomId
) {
}
