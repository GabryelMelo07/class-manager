package com.class_manager.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.class_manager.backend.model.Semester;

public interface SemesterRepository extends JpaRepository<Semester, Long> {

	@Query("""
			SELECT s FROM Semester s ORDER BY
			CASE s.status WHEN 'ACTIVE' THEN 0 WHEN 'FINALIZED' THEN 1 ELSE 2 END, s.startDate ASC
			""")
	Page<Semester> findAllOrderByStatusActive(Pageable pageable);

}
