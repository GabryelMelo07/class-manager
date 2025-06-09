package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.class_manager.backend.model.Discipline;
import com.class_manager.backend.service.DisciplineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/disciplines")
public class DisciplineController {

	private final DisciplineService disciplineService;

	@GetMapping
	public ResponseEntity<Page<Discipline>> findAllByCourse(@RequestParam Long courseId, Pageable pageable) {
		return ResponseEntity.ok(disciplineService.findAll(courseId, pageable));
	}

	@GetMapping("/all")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Page<Discipline>> findAll(Pageable pageable) {
		return ResponseEntity.ok(disciplineService.findAll(pageable));
	}

	@PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Discipline> save(@RequestBody DisciplineDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(disciplineService.save(dto));
	}

	@Operation(summary = "Partially update a discipline", description = "Updates only the provided fields of a discipline. Requires teacherId to be a valid User with the Teacher Role.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Discipline successfully updated"),
			@ApiResponse(responseCode = "404", description = "Discipline or teacher not found"),
			@ApiResponse(responseCode = "400", description = "Invalid teacher provided")
	})
	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Discipline> patch(@PathVariable Long id, @RequestBody DisciplineDto disciplineDto) {
		return ResponseEntity.ok(disciplineService.patch(id, disciplineDto));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		disciplineService.deleteSoft(id);
		return ResponseEntity.noContent().build();
	}

}
