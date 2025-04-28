package com.class_manager.backend.dto.model.teacher;

import java.util.UUID;

import com.class_manager.backend.enums.RoleName;

public record TeacherResponseDto(UUID id, String email, String name, String surname, RoleName role) {
}
