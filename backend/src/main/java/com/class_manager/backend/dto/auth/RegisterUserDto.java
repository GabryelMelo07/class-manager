package com.class_manager.backend.dto.auth;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.User;

public record RegisterUserDto(User newUser, RoleName role) {
}
