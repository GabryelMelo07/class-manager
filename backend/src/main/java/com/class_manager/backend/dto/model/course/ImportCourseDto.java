package com.class_manager.backend.dto.model.course;

import com.class_manager.backend.decorators.ValidString;

public record ImportCourseDto(@ValidString String name, @ValidString String abbreviation, @ValidString String coordinatorEmail) {
}
