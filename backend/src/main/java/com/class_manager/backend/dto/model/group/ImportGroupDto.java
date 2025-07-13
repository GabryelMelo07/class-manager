package com.class_manager.backend.dto.model.group;

import com.class_manager.backend.decorators.ValidString;

import jakarta.validation.constraints.Positive;

public record ImportGroupDto(
    @ValidString String name,
    @ValidString String abbreviation,
	@ValidString String color,
	@Positive Integer semesterOfCourse,
    @ValidString String disciplineName,
    @ValidString String classRoomName
) {
}
