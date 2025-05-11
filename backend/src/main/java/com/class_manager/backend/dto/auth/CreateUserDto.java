package com.class_manager.backend.dto.auth;

import java.util.List;

import com.class_manager.backend.enums.RoleName;

public record CreateUserDto(String email, String password, String name, String surname, List<RoleName> roles) {
}
