package com.class_manager.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.User;

public interface CourseRepository extends JpaRepository<Course, Long> {

	@Query("""
			SELECT DISTINCT c FROM Course c
				LEFT JOIN c.disciplines d
				WHERE c.coordinator = :user OR d.teacher = :user
	""")
	Page<Course> findAllByUser(@Param("user") User user, Pageable pageable);

}
