package com.class_manager.backend.exceptions;

public class UnauthorizedException extends RuntimeException {
	public UnauthorizedException(String message) {
		super(message);
	}
	
	public UnauthorizedException() {
		super("Not authorized to access this resource");
	}
}
