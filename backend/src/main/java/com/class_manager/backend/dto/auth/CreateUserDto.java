package com.class_manager.backend.dto.auth;

import java.util.Set;

public record CreateUserDto(String email, String password, String name, String surname, Set<String> roles) {
}
