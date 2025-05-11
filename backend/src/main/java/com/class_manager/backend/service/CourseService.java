package com.class_manager.backend.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.course.CourseDto;
import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.CourseRepository;
import com.class_manager.backend.repository.UserRepository;
import com.class_manager.backend.utils.Patcher;

import static com.class_manager.backend.utils.UserScopeUtils.isCoordinator;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CourseService {

	private final CourseRepository courseRepository;
	private final UserRepository userRepository;

	public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
		this.courseRepository = courseRepository;
		this.userRepository = userRepository;
	}

	public Page<Course> findAll(Pageable pageable) {
		return courseRepository.findAll(pageable);
	}

	public Optional<Course> findById(Long id) {
		return courseRepository.findById(id);
	}

	public Course save(CourseDto dto) {
		User coordinator = userRepository.findById(dto.coordinatorId())
				.orElseThrow(() -> new EntityNotFoundException(
						"Coordinator not found with id: " + dto.coordinatorId()));

		if (!isCoordinator(coordinator)) {
			throw new IllegalArgumentException("User with id: " + dto.coordinatorId() + " is not a Coordinator");
		}

		Course course = new Course(dto);
		course.setCoordinator(coordinator);

		return courseRepository.save(course);
	}

	public Course patch(Long courseId, CourseDto dto) {
		Course existingCourse = courseRepository.findById(courseId)
				.orElseThrow(() -> new EntityNotFoundException(
						"Course not found with id: " + courseId));

		Course partialCourse = new Course(dto);
		UUID coordinatorId = dto.coordinatorId();

		if (coordinatorId != null) {
			User coordinator = userRepository.findById(dto.coordinatorId())
					.orElseThrow(() -> new EntityNotFoundException(
							"Coordinator not found with id: " + dto.coordinatorId()));
	
			if (!isCoordinator(coordinator)) {
				throw new IllegalArgumentException("User with id: " + dto.coordinatorId() + " is not a Coordinator");
			}

			existingCourse.setCoordinator(coordinator);
		}

		try {
			Patcher.patch(existingCourse, partialCourse);
			return courseRepository.save(existingCourse);
		} catch (IllegalAccessException e) {
			log.error("Error when trying to patch (Partial Update) the Course entity with id: {}", courseId, e);
			throw new RuntimeException("Failed to patch Course", e);
		}
	}

	public void deleteById(Long id) {
		courseRepository.deleteById(id);
	}

}
