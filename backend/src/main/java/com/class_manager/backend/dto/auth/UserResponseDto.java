package com.class_manager.backend.dto.auth;

import java.util.UUID;

import com.class_manager.backend.enums.RoleName;

public record UserResponseDto(UUID id, String email, String name, String surname, RoleName roles) {
}
