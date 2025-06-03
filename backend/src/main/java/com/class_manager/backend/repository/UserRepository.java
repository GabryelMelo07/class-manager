package com.class_manager.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.User;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

	@Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :role")
    Page<User> findByRole(@Param("role") RoleName role, Pageable pageable);
}
