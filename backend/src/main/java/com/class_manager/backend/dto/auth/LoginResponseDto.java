package com.class_manager.backend.dto.auth;

public record LoginResponseDto(String accessToken, String refreshToken) {
}
