package com.class_manager.backend.config.security.validators;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.Role;
import com.class_manager.backend.repository.RoleRepository;

@Component
public class ScopeValidator implements OAuth2TokenValidator<Jwt> {

	private final RoleRepository roleRepository;

	public ScopeValidator(RoleRepository roleRepository) {
		this.roleRepository = roleRepository;
	}

	@Override
	public OAuth2TokenValidatorResult validate(Jwt token) {
		String scope = token.getClaimAsString("scope");

		if (scope != null) {
			Role role = roleRepository.findByName(RoleName.valueOf(scope.toUpperCase()));
			if (role != null) {
				return OAuth2TokenValidatorResult.success();
			}
		}

		return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Invalid scopes", null));
	}

}
