package com.class_manager.backend.config.security;

import com.class_manager.backend.config.security.validators.ScopeValidator;
import com.class_manager.backend.config.security.validators.SubjectValidator;
import com.class_manager.backend.config.security.validators.IssuedAtValidator;
import com.class_manager.backend.config.security.validators.ExpiresAtValidator;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	@Value("${jwt.public.key}")
	private RSAPublicKey publicKey;

	@Value("${jwt.private.key}")
	private RSAPrivateKey privateKey;

	@Value("${api.url}")
	private String issuer;

	private final SubjectValidator subjectValidator;

	private final ScopeValidator scopeValidator;

	public SecurityConfig(SubjectValidator subjectValidator, ScopeValidator scopeValidator) {
		this.subjectValidator = subjectValidator;
		this.scopeValidator = scopeValidator;
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.authorizeHttpRequests(authorize -> authorize
				.requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
				.requestMatchers(HttpMethod.POST, "/auth/reset-password").permitAll()
				.requestMatchers(HttpMethod.POST, "/auth/reset-password/request").permitAll()
				.requestMatchers(HttpMethod.POST, "/auth/refresh-token").permitAll()
				.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
				.anyRequest().authenticated())
				.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		return http.build();
	}

	@Bean
	@Primary
	JwtDecoder jwtDecoder() {
		NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withPublicKey(publicKey).build();
		
		List<OAuth2TokenValidator<Jwt>> validators = new ArrayList<>();
		
		// Default Validators
		validators.add(JwtValidators.createDefault());
		validators.add(JwtValidators.createDefaultWithIssuer(issuer));

		// Custom Validators
		validators.add(new IssuedAtValidator());
		validators.add(new ExpiresAtValidator());
		validators.add(scopeValidator);
		validators.add(subjectValidator);

		OAuth2TokenValidator<Jwt> combinedValidators = new DelegatingOAuth2TokenValidator<>(validators);
		jwtDecoder.setJwtValidator(combinedValidators);
		return jwtDecoder;
	}

	@Bean
	JwtEncoder jwtEncoder() {
		JWK jwk = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
		var jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
		return new NimbusJwtEncoder(jwks);
	}

	@Bean
	BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}

}
