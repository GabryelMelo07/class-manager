package com.class_manager.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import lombok.ToString;

@ToString
public enum RoleName {
	
	ADMIN("admin"),
	COORDINATOR("coordinator"),
	TEACHER("teacher"),
	VISITOR("visitor");

	private final String roleName;

	RoleName(String roleName) {
		this.roleName = roleName;
	}

	@JsonValue
	public String getRoleName() {
		return roleName;
	}
	
	@JsonCreator
	public static RoleName fromString(String role) {
		for (RoleName r : RoleName.values()) {
			if (r.roleName.equalsIgnoreCase(role)) {
				return r;
			}
		}
		
		throw new IllegalArgumentException("Nenhum perfil de acesso encontrado com o nome: " + role);
	}

}
