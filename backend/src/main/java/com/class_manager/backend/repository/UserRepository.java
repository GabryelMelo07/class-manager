package com.class_manager.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.enums.RoleName;
import com.class_manager.backend.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
	Optional<User> findByEmail(String email);

	@Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :role")
	Page<User> findByRole(@Param("role") RoleName role, Pageable pageable);

	@Query("""
			    SELECT u FROM User u
			    JOIN u.roles r
			    WHERE r.name = 'TEACHER'
			    AND u.active = true
			    AND u.id NOT IN (
			        SELECT DISTINCT d.teacher.id
			        FROM Schedule s
			        JOIN s.group g
			        JOIN g.discipline d
			        WHERE s.semester.id = :semesterId
			    )
			""")
	List<User> findUnassignedTeachersBySemester(@Param("semesterId") Long semesterId);
}
