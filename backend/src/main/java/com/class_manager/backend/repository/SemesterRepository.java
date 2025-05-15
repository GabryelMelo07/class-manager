package com.class_manager.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.class_manager.backend.model.Semester;

public interface SemesterRepository extends JpaRepository<Semester, Long> {
	@Query("""
				SELECT s FROM Semester s
					WHERE s.year = :year AND s.semester = :semester AND s.status = 'ACTIVE'
			""")
	Optional<Semester> findCurrentSemester(@Param("year") int year, @Param("semester") int semester);

	@Query("""
				SELECT s FROM Semester s
					WHERE s.status = 'ACTIVE'
			""")
	Optional<Semester> findActiveSemester();
}
