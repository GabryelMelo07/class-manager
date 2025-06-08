package com.class_manager.backend.dto.auth;

import java.util.List;

import com.class_manager.backend.enums.RoleName;

public record UpdateUserDto(String email, String name, String surname, List<RoleName> roles) {
}
