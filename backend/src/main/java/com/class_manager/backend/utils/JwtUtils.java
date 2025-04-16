package com.class_manager.backend.utils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import com.class_manager.backend.model.Role;
import com.class_manager.backend.model.User;

@Component
public class JwtUtils {

	private final JwtEncoder jwtEncoder;

	public JwtUtils(JwtEncoder jwtEncoder) {
		this.jwtEncoder = jwtEncoder;
	}

	private JwtClaimsSet buildJwtTokenClaims(String issuer, String subject, String name, String surname,
			String scopes) {
		Instant now = Instant.now();
		Instant expiresAt = now.plus(1, ChronoUnit.HOURS);

		return JwtClaimsSet.builder()
				.issuer(issuer)
				.subject(subject)
				.issuedAt(now)
				.expiresAt(expiresAt)
				.claim("name", "%s %s".formatted(name, surname))
				.claim("scope", scopes)
				.build();
	}

	public String buildJwtAccessToken(String issuer, String subject, User user) {
		String scopes = user.getRoles()
				.stream()
				.map(Role::getName)
				.collect(Collectors.joining(" "));

		var tokenClaims = buildJwtTokenClaims(issuer, subject, user.getName(), user.getSurname(), scopes);

		return jwtEncoder.encode(JwtEncoderParameters.from(tokenClaims)).getTokenValue();
	}

}
