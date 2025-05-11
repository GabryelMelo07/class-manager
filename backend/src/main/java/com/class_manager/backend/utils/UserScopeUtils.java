package com.class_manager.backend.utils;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.User;

public class UserScopeUtils {

	private UserScopeUtils() {
		throw new UnsupportedOperationException("Utility class, shouldn't be instantiated");
	}
	
	private static boolean hasRole(User user, RoleName roleName) {
		return user.getRoles().stream()
				.anyMatch(role -> role.getName().equals(roleName));
	}
	
	public static boolean isTeacher(User user) {
		return hasRole(user, RoleName.TEACHER);
	}

	public static boolean isCoordinator(User user) {
		return hasRole(user, RoleName.COORDINATOR);
	}

}
