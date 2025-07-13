package com.class_manager.backend.dto.auth;

import java.util.List;

import com.class_manager.backend.decorators.ValidString;
import com.class_manager.backend.enums.RoleName;

public record CreateUserDto(@ValidString String email, @ValidString String password, @ValidString String name, @ValidString String surname, List<RoleName> roles) {
}
