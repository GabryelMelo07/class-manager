package com.class_manager.backend.exceptions;

public class JwtTokenValidationException extends RuntimeException {

    public JwtTokenValidationException(String message) {
        super(message);
    }

    public JwtTokenValidationException() {
        super("Token JWT inválido");
    }
    
}
