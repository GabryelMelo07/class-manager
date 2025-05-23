package com.class_manager.backend.dto.model.course;

import java.util.List;

import com.class_manager.backend.model.Course;

public record CoordinatorCoursesResponseDto(
	Course coordinatorCourse,
	List<Course> teachingCourses
) {
}
