package com.class_manager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
	Role findByName(RoleName name);
}
