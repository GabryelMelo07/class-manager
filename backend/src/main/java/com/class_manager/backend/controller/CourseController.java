package com.class_manager.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import com.class_manager.backend.service.CourseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}

	/*
	 * TODO: O coordenador deve receber no retorno 2 listas,
	 * A primeira lista dos cursos que ele é coordenador
	 * E a segunda lista dos cursos que ele é professor, ou seja,
	 * não tem permissão para editar.
	 */
	
	@GetMapping
	public ResponseEntity<Page<Course>> findAll(Pageable pageable, JwtAuthenticationToken token) {
		return ResponseEntity.ok(courseService.findAllByUser(pageable, token));
	}

	@GetMapping("/admin")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Page<Course>> findAllCoursesByAdmin(Pageable pageable, JwtAuthenticationToken token) {
		return ResponseEntity.ok(courseService.findAll(pageable, token));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Course> findById(@PathVariable Long id) {
		return courseService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
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
	public ResponseEntity<Course> patch(@PathVariable Long id, @RequestBody CourseDto courseDto) {
		return ResponseEntity.ok(courseService.patch(id, courseDto));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		courseService.deleteById(id);
		return ResponseEntity.noContent().build();
	}
	
}
