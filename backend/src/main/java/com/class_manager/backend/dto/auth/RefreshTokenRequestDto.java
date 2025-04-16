package com.class_manager.backend.dto.auth;

import com.class_manager.backend.decorators.ValidString;

public record RefreshTokenRequestDto(@ValidString String accessToken, @ValidString String refreshToken) {
}
