package com.class_manager.backend.controller;

import static com.class_manager.backend.utils.UserScopeUtils.isAdmin;
import static com.class_manager.backend.utils.UserScopeUtils.isCoordinator;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.model.course.CourseDto;
import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.User;
import com.class_manager.backend.service.CourseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/courses")
public class CourseController {

	private final CourseService courseService;
	
	@GetMapping
	public ResponseEntity<?> findAll(JwtAuthenticationToken token) {
		User user = courseService.getUserFromToken(token);
		
		if (isCoordinator(user)) {
			return ResponseEntity.ok(courseService.findAllByCoordinatorUser(token));
		}

		if (isAdmin(user)) {
			return ResponseEntity.ok(courseService.findAllByAdminUser(token));
		}
		
		return ResponseEntity.ok(courseService.findAllByUser(token));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Course> findById(@PathVariable Long id) {
		return courseService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Course> save(@RequestBody CourseDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(courseService.save(dto));
	}

	@Operation(summary = "Partially update a course", description = "Updates only the provided fields of a course. Requires coordinatorId to be a valid User with the Coordinator Role.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Course successfully updated"),
			@ApiResponse(responseCode = "404", description = "Course or coordinator not found"),
			@ApiResponse(responseCode = "400", description = "Invalid coordinator provided")
	})
	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Course> patch(@PathVariable Long id, @RequestBody CourseDto courseDto) {
		return ResponseEntity.ok(courseService.patch(id, courseDto));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		courseService.deleteSoft(id);
		return ResponseEntity.noContent().build();
	}
	
}
