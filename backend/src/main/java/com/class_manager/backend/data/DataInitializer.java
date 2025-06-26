package com.class_manager.backend.data;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.Role;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.RoleRepository;
import com.class_manager.backend.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DataInitializer implements ApplicationRunner {

	private final BCryptPasswordEncoder passwordEncoder;
	private final RoleRepository roleRepository;
	private final UserRepository userRepository;

	private final Boolean generateInitialAdminUser;
	private final String adminPassword;
	private final String adminEmail;
	private final String adminName;
	private final String adminSurname;

	public DataInitializer(
			BCryptPasswordEncoder passwordEncoder,
			RoleRepository roleRepository,
			UserRepository userRepository,
			@Value("${generate.admin.user}") Boolean generateInitialAdminUser,
			@Value("${admin.config.password}") String adminPassword,
			@Value("${admin.config.email}") String adminEmail,
			@Value("${admin.config.name}") String adminName,
			@Value("${admin.config.surname}") String adminSurname) {
		this.passwordEncoder = passwordEncoder;
		this.roleRepository = roleRepository;
		this.userRepository = userRepository;
		this.generateInitialAdminUser = generateInitialAdminUser;
		this.adminPassword = adminPassword;
		this.adminEmail = adminEmail;
		this.adminName = adminName;
		this.adminSurname = adminSurname;
	}

	/**
	 * Initializes the data for the application.
	 */
	@Override
	public void run(ApplicationArguments args) throws Exception {
		log.info("Inserting initial data from app_settings.json file");

		createUserRoles();
		createInitialAdminUser();
	}

	/**
	 * Persists the user roles specified in the JSON configuration file to the
	 * database.
	 */
	void createUserRoles() {
		try {
			log.info("Creating user roles");

			List<Role> existingRoles = roleRepository.findAll();

			Set<RoleName> existingNames = existingRoles.stream()
					.map(Role::getName)
					.collect(Collectors.toSet());

			List<Role> newRoles = Arrays.stream(RoleName.values())
					.filter(roleName -> !existingNames.contains(roleName))
					.map(Role::new)
					.toList();

			if (!newRoles.isEmpty()) {
				roleRepository.saveAll(newRoles);
				log.info("{} user roles created successfully", newRoles.size());
			} else {
				log.info("All roles already exist, skipping creation");
			}
		} catch (Exception e) {
			String errorMessage = "Error when trying to insert initial data";
			log.error(errorMessage + ": {}", e.getMessage());
			throw new RuntimeException(errorMessage, e);
		}
	}

	/**
	 * Creates and persists the initial admin user defined in the application
	 * configuration.
	 */
	void createInitialAdminUser() {
		try {
			if (!generateInitialAdminUser) {
				log.info("Skipping creation of initial admin user as per configuration");
				return;
			}
			
			log.info("Creating initial admin user");

			if (userRepository.findByEmail(adminEmail).isPresent()) {
				log.info("Initial admin user already exists, skipping creation");
				return;
			}

			Role role = roleRepository.findByName(RoleName.ADMIN)
					.orElseThrow(() -> new IllegalStateException("Access profile " + RoleName.ADMIN
							+ " not found in the database. Unable to create the initial user."));

			User user = new User();
			user.setEmail(adminEmail);
			user.setPassword(passwordEncoder.encode(adminPassword));
			user.setName(adminName);
			user.setSurname(adminSurname);
			user.setRoles(Set.of(role));

			userRepository.save(user);

			log.info("Initial admin user successfully created: {}", user.getEmail());
		} catch (Exception e) {
			String errorMessage = "Error while trying to create the initial admin user";
			log.error(errorMessage + ": {}", e.getMessage());
			throw new RuntimeException(errorMessage, e);
		}
	}

}
