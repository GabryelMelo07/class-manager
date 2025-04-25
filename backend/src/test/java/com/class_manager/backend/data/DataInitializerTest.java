package com.class_manager.backend.data;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.class_manager.backend.dto.AppConfigProperties;
import com.class_manager.backend.dto.config_properties.InitialAdminUser;
import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.Role;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.RoleRepository;
import com.class_manager.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

	@Mock
	private AppConfigProperties appConfigProperties;

	@Mock
	private RoleRepository roleRepository;

	@Mock
	private UserRepository userRepository;

	@Mock
	private BCryptPasswordEncoder passwordEncoder;

	@InjectMocks
	private DataInitializer dataInitializer;

	@Test
	void shouldNotCreateRolesIfTheyAlreadyExist() {
		when(roleRepository.findAll()).thenReturn(List.of(
			new Role(RoleName.ADMIN),
			new Role(RoleName.COORDINATOR),
			new Role(RoleName.TEACHER),
			new Role(RoleName.VISITOR)
		));

		dataInitializer.createUserRoles();

		verify(roleRepository).findAll();
		verify(roleRepository, never()).saveAll(anyList());
	}
	
	@Test
	void shouldHandleExceptionWhenSavingRoles() {
		when(roleRepository.findAll()).thenReturn(List.of());
		doThrow(new RuntimeException("Database error")).when(roleRepository).saveAll(anyList());

		assertThrows(RuntimeException.class, () -> {
			dataInitializer.createUserRoles();
		});
	}

	@Test
	void shouldCreateInitialAdminUser() {
		InitialAdminUser mockInitialUser = new InitialAdminUser("admin@example.com", "admin123", "Admin", "User");
		when(appConfigProperties.initialAdminUser()).thenReturn(mockInitialUser);
		when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.empty());

		Role adminRole = new Role(RoleName.ADMIN);
		when(roleRepository.findByName(RoleName.ADMIN)).thenReturn((adminRole));

		when(passwordEncoder.encode("admin123")).thenReturn("encodedPassword");

		ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

		dataInitializer.createInitialAdminUser();

		verify(userRepository).save(userCaptor.capture());

		User savedUser = userCaptor.getValue();
		assertEquals("admin@example.com", savedUser.getEmail());
		assertEquals("encodedPassword", savedUser.getPassword());
		assertEquals("Admin", savedUser.getName());
		assertEquals("User", savedUser.getSurname());
		assertEquals(adminRole, savedUser.getRole());
	}

	@Test
	void shouldHandleExceptionWhenSavingInitialAdminUser() {
		InitialAdminUser initialAdminUser = new InitialAdminUser("admin@example.com", "admin123", "Admin", "User");
		when(appConfigProperties.initialAdminUser()).thenReturn(initialAdminUser);
		when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.empty());
		when(roleRepository.findByName(RoleName.ADMIN)).thenReturn(new Role(RoleName.ADMIN));

		when(passwordEncoder.encode("admin123")).thenReturn("encodedPassword");
		doThrow(new RuntimeException("Database error")).when(userRepository).save(any(User.class));

		assertThrows(RuntimeException.class, () -> {
			dataInitializer.createInitialAdminUser();
		});
	}
}
