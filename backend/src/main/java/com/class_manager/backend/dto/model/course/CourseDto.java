package com.class_manager.backend.dto.model.course;

import java.util.UUID;

import com.class_manager.backend.decorators.ValidString;

public record CourseDto(@ValidString String name, @ValidString String abbreviation, UUID coordinatorId) {
}
