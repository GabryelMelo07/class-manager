package com.class_manager.backend.dto.auth;

import com.class_manager.backend.enums.RoleName;

public record CreateUserDto(String email, String password, String name, String surname, RoleName role) {
}
