package com.class_manager.backend.utils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import com.class_manager.backend.model.User;

@Component
public class JwtUtils {

	private final JwtEncoder jwtEncoder;

	public JwtUtils(JwtEncoder jwtEncoder) {
		this.jwtEncoder = jwtEncoder;
	}

	private JwtClaimsSet buildJwtTokenClaims(String issuer, String subject, String name, String surname,
			String scope) {
		Instant now = Instant.now();
		Instant expiresAt = now.plus(1, ChronoUnit.HOURS);

		return JwtClaimsSet.builder()
				.issuer(issuer)
				.subject(subject)
				.issuedAt(now)
				.expiresAt(expiresAt)
				.claim("name", "%s %s".formatted(name, surname))
				.claim("scope", scope)
				.build();
	}

	public String buildJwtAccessToken(String issuer, String subject, User user) {
		String scope = user.getRole().getName().name();
		var tokenClaims = buildJwtTokenClaims(issuer, subject, user.getName(), user.getSurname(), scope);
		return jwtEncoder.encode(JwtEncoderParameters.from(tokenClaims)).getTokenValue();
	}

}
