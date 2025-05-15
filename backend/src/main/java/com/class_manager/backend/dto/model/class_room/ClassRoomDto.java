package com.class_manager.backend.dto.model.class_room;

import com.class_manager.backend.decorators.ValidString;

public record ClassRoomDto(
	@ValidString String name,
	@ValidString String abbreviation,
	String location
) {
}
