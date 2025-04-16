package com.class_manager.backend.dto;

import java.util.Set;
import java.util.UUID;

import com.class_manager.backend.model.Role;

public record UserResponseDto(UUID id, String email, String name, String surname, Set<Role> roles) {
}
