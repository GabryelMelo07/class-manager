package com.class_manager.backend.exceptions;

public class ResetPasswordTokenInvalidException extends RuntimeException {

    public ResetPasswordTokenInvalidException(String message) {
        super(message);
    }

    public ResetPasswordTokenInvalidException() {
        super("Token de redefinição de senha inválido");
    }
    
}
