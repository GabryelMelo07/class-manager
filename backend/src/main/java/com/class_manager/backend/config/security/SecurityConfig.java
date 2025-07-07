package com.class_manager.backend.config.security;

import com.class_manager.backend.config.security.validators.ScopeValidator;
import com.class_manager.backend.config.security.validators.SubjectValidator;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;

import org.springframework.beans.factory.annotation.Qualifier;
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
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
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

	private final String apiIssuer;
	private final RSAPublicKey publicKey;
	private final RSAPrivateKey privateKey;
	private final ScopeValidator scopeValidator;
	private final SubjectValidator subjectValidator;

	public SecurityConfig(
			@Value("${jwt.public.key}") RSAPublicKey publicKey,
			@Value("${jwt.private.key}") RSAPrivateKey privateKey,
			@Value("${api.issuer}") String apiIssuer,
			SubjectValidator subjectValidator,
			ScopeValidator scopeValidator) {
		this.publicKey = publicKey;
		this.privateKey = privateKey;
		this.apiIssuer = apiIssuer;
		this.subjectValidator = subjectValidator;
		this.scopeValidator = scopeValidator;
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		http.authorizeHttpRequests(authorize -> authorize
				.requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/v1/auth/reset-password").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/v1/auth/reset-password/request").permitAll()
				.requestMatchers(HttpMethod.POST, "/api/v1/auth/refresh-token").permitAll()
				.requestMatchers(HttpMethod.GET, "/api/v1/schedules/public").permitAll()
				.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
				.anyRequest().authenticated())
				.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

		return http.build();
	}

	private JwtDecoder buildJwtDecoder(List<OAuth2TokenValidator<Jwt>> validators) {
		NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withPublicKey(publicKey).build();
		OAuth2TokenValidator<Jwt> combinedValidators = new DelegatingOAuth2TokenValidator<>(validators);
		jwtDecoder.setJwtValidator(combinedValidators);
		return jwtDecoder;
	}

	@Bean
	@Primary
	JwtDecoder jwtDecoder() {
		List<OAuth2TokenValidator<Jwt>> validators = new ArrayList<>();
		validators.add(JwtValidators.createDefaultWithIssuer(apiIssuer));
		validators.add(scopeValidator);
		validators.add(subjectValidator);
		return buildJwtDecoder(validators);
	}

	@Bean
	@Qualifier("noExpiresAtValidatorJwtDecoder")
	JwtDecoder noExpiresAtValidatorJwtDecoder() {
		List<OAuth2TokenValidator<Jwt>> validators = new ArrayList<>();
		validators.add(new JwtIssuerValidator(apiIssuer));
		validators.add(scopeValidator);
		validators.add(subjectValidator);
		return buildJwtDecoder(validators);
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
