package com.class_manager.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.User;

public interface CourseRepository extends JpaRepository<Course, Long> {

	@Query("""
			SELECT c FROM Course c
				WHERE c.active = true AND c.coordinator = :user
	""")
	Course findCoordinatedCourseByUser(@Param("user") User user);

	@Query("""
			SELECT DISTINCT c FROM Course c
				LEFT JOIN c.disciplines d
				WHERE c.active = true AND d.teacher = :user AND NOT c.coordinator = :user
	""")
	List<Course> findTeachingCoursesByUser(@Param("user") User user);
	
	List<Course> findByActiveTrue();

}
