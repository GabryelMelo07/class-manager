package com.class_manager.backend.dto.auth;

import com.class_manager.backend.decorators.ValidString;

import io.swagger.v3.oas.annotations.media.Schema;

public record LoginRequestDto(
		@Schema(description = "Email do usuário", defaultValue = "admin@riogrande.ifrs.edu.br") @ValidString String email,
		@Schema(description = "Senha do usuário", defaultValue = "admin") @ValidString String password) {
}
