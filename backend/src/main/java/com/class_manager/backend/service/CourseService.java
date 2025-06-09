package com.class_manager.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.course.CoordinatorCoursesResponseDto;
import com.class_manager.backend.dto.model.course.CourseDto;
import com.class_manager.backend.exceptions.UnauthorizedException;
import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.CourseRepository;
import com.class_manager.backend.repository.UserRepository;
import com.class_manager.backend.utils.Patcher;

import static com.class_manager.backend.utils.UserScopeUtils.*;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

	private final CourseRepository courseRepository;
	private final UserRepository userRepository;

	public List<Course> findAllByUser(JwtAuthenticationToken token) {
		User user = getUserFromToken(token);
		return courseRepository.findTeachingCoursesByUser(user);
	}

	public CoordinatorCoursesResponseDto findAllByCoordinatorUser(JwtAuthenticationToken token) {
		User user = getUserFromToken(token);

		if (!isCoordinator(user)) {
			throw new UnauthorizedException();
		}

		Course coordinatorCourse = courseRepository.findCoordinatedCourseByUser(user);
		List<Course> teachingCourses = courseRepository.findTeachingCoursesByUser(user);

		return new CoordinatorCoursesResponseDto(coordinatorCourse, teachingCourses);
	}

	public List<Course> findAllByAdminUser(JwtAuthenticationToken token) {
		User user = getUserFromToken(token);

		if (!isAdmin(user)) {
			throw new UnauthorizedException();
		}

		return courseRepository.findByActiveTrue();
	}

	public Optional<Course> findById(Long id) {
		return courseRepository.findById(id);
	}

	public Course save(CourseDto dto) {
		User coordinator = userRepository.findById(dto.coordinatorId())
				.orElseThrow(() -> new EntityNotFoundException(
						"Coordinator not found"));

		if (!isCoordinator(coordinator)) {
			throw new IllegalArgumentException("User is not a Coordinator");
		}

		Course course = new Course(dto);
		course.setCoordinator(coordinator);

		return courseRepository.save(course);
	}

	public Course patch(Long courseId, CourseDto dto) {
		Course existingCourse = courseRepository.findById(courseId)
				.orElseThrow(() -> new EntityNotFoundException(
						"Course not found"));

		if (existingCourse.getActive() == false) {
			throw new RuntimeException("Failed to patch Course");
		}

		Course partialCourse = new Course(dto);
		UUID coordinatorId = dto.coordinatorId();

		if (coordinatorId != null) {
			User coordinator = userRepository.findById(dto.coordinatorId())
					.orElseThrow(() -> new EntityNotFoundException(
							"Coordinator not found"));

			if (!isCoordinator(coordinator)) {
				throw new IllegalArgumentException("User is not a Coordinator");
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

	public void deleteSoft(Long id) {
		Course course = courseRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Course not found."));

		course.setActive(false);
		courseRepository.save(course);
	}

	public User getUserFromToken(JwtAuthenticationToken token) {
		UUID userId = UUID.fromString(token.getName());
		return userRepository.findById(userId)
				.orElseThrow(() -> new EntityNotFoundException(
						"User not found"));
	}

}
