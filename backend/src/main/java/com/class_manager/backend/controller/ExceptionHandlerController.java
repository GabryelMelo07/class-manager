package com.class_manager.backend.controller;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.class_manager.backend.dto.RestErrorMessage;
import com.class_manager.backend.exceptions.InvalidScheduleException;
import com.class_manager.backend.exceptions.JwtTokenValidationException;
import com.class_manager.backend.exceptions.ResetPasswordTokenInvalidException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class ExceptionHandlerController extends ResponseEntityExceptionHandler {

	private ResponseEntity<RestErrorMessage> buildResponse(HttpStatus status, String message, Throwable throwable) {
		if (throwable != null) {
			String errorMessage = """
			\n#####################################

			Http Status: %s
				
			Error Message: %s

			Stack Trace: %s
				
			#####################################
			""".formatted(status.value(), message, throwable.getMessage());
			logger.error(errorMessage, throwable);
		}
		
        RestErrorMessage response = new RestErrorMessage(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")), status, message);
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(response);
    }

	@ExceptionHandler(AuthorizationDeniedException.class)
	private ResponseEntity<RestErrorMessage> authorizationDeniedHandler(AuthorizationDeniedException exception) {
		return buildResponse(HttpStatus.UNAUTHORIZED, exception.getMessage(), exception);
	}

	@ExceptionHandler(JwtTokenValidationException.class)
	private ResponseEntity<RestErrorMessage> jwtTokenValidationExceptionHandler(JwtTokenValidationException exception) {
		return buildResponse(HttpStatus.UNAUTHORIZED, exception.getMessage(), exception);
	}

	@ExceptionHandler(BadCredentialsException.class)
	private ResponseEntity<RestErrorMessage> badCredentialsExceptionHandler(BadCredentialsException exception) {
		return buildResponse(HttpStatus.UNAUTHORIZED, exception.getMessage(), exception);
	}

	@ExceptionHandler(EntityNotFoundException.class)
	private ResponseEntity<RestErrorMessage> entityNotFoundExceptionHandler(EntityNotFoundException exception) {
		return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), exception);
	}

	@ExceptionHandler(JsonMappingException.class)
	private ResponseEntity<RestErrorMessage> jsonMappingExceptionHandler(JsonMappingException exception) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage(), exception);
	}

	@ExceptionHandler(JsonProcessingException.class)
	private ResponseEntity<RestErrorMessage> jsonProcessingExceptionHandler(JsonProcessingException exception) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage(), exception);
	}

	@ExceptionHandler(ResetPasswordTokenInvalidException.class)
	private ResponseEntity<RestErrorMessage> resetPasswordTokenInvalidExceptionHandler(ResetPasswordTokenInvalidException exception) {
		return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), exception);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	private ResponseEntity<RestErrorMessage> dataIntegrityViolationExceptionHandler(DataIntegrityViolationException exception) {
		return buildResponse(HttpStatus.CONFLICT, "Data Integrity Violation", exception);
	}

	@ExceptionHandler(DataAccessException.class)
	private ResponseEntity<RestErrorMessage> dataAccessExceptionHandler(DataAccessException exception) {
		return buildResponse(HttpStatus.BAD_REQUEST, "Data access error", exception);
	}

	@ExceptionHandler(InvalidScheduleException.class)
	private ResponseEntity<RestErrorMessage> invalidScheduleExceptionHandler(InvalidScheduleException exception) {
		return buildResponse(HttpStatus.CONFLICT, exception.getMessage(), exception);
	}

	@ExceptionHandler(MessagingException.class)
	private ResponseEntity<RestErrorMessage> messagingExceptionHandler(MessagingException exception) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error trying to send email async", exception);
	}

	@ExceptionHandler(Exception.class)
	private ResponseEntity<RestErrorMessage> genericExceptionHandler(Exception exception) {
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage(), exception);
	}

}
