package com.class_manager.backend.dto.auth;

import com.class_manager.backend.decorators.ValidString;

public record ResetPasswordDto(@ValidString String newPassword) {
}
