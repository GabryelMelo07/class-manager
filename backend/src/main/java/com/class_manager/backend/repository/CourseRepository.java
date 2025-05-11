package com.class_manager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.class_manager.backend.model.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
