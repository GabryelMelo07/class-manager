package com.class_manager.backend.utils;

import java.time.Instant;
import java.util.stream.Collectors;

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

	private JwtClaimsSet buildJwtTokenClaims(String issuer, String subject, Instant expiresAt, String name, String surname,
			String scope) {
		Instant now = Instant.now();

		return JwtClaimsSet.builder()
				.issuer(issuer)
				.subject(subject)
				.issuedAt(now)
				.expiresAt(expiresAt)
				.claim("name", "%s %s".formatted(name, surname))
				.claim("scope", scope)
				.build();
	}

	public String buildJwtAccessToken(String issuer, String subject, Instant expiresAt, User user) {
		String scope = user.getRoles()
				.stream()
				.map(role -> role.getName().getRoleName())
				.collect(Collectors.joining(" "));

		var tokenClaims = buildJwtTokenClaims(issuer, subject, expiresAt, user.getName(), user.getSurname(), scope);
		return jwtEncoder.encode(JwtEncoderParameters.from(tokenClaims)).getTokenValue();
	}

}
