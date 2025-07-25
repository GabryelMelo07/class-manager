package com.class_manager.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.class_manager.backend.model.Semester;

public interface SemesterRepository extends JpaRepository<Semester, Long> {

	@Query("""
			SELECT s FROM Semester s
			WHERE s.active = true
			ORDER BY
				CASE s.status
					WHEN 'ACTIVE' THEN 0
					WHEN 'FINALIZED' THEN 1
					ELSE 2
				END,
				s.startDate ASC
			""")
	Page<Semester> findAllOrderByStatusActive(Pageable pageable);

	Optional<Semester> findByYearAndNumber(int year, int number);

}
