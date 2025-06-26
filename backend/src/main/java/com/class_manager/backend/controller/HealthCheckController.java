package com.class_manager.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class HealthCheckController {

    private final String apiKey;

	public HealthCheckController(@Value("${health.check.api.key}") String apiKey) {
		this.apiKey = apiKey;
	}

    @GetMapping("/health-check")
    public ResponseEntity<String> healthCheck(@RequestHeader("x-api-key") String key) {
		log.info("Health check request received");
		
        if (apiKey.equals(key)) {
			log.info("Health check request authorized");
            return ResponseEntity.ok("OK");
        }
		
		log.warn("Unauthorized health check request with key: {}", key);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
    }
}
