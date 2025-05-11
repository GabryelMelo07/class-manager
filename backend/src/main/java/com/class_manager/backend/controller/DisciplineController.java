package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.class_manager.backend.model.Discipline;
import com.class_manager.backend.service.DisciplineService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/disciplines")
public class DisciplineController {

	private final DisciplineService disciplineService;

	public DisciplineController(DisciplineService disciplineService) {
		this.disciplineService = disciplineService;
	}

	@GetMapping
	public ResponseEntity<Page<Discipline>> findAll(Pageable pageable) {
		return ResponseEntity.ok(disciplineService.findAll(pageable));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Discipline> findById(@PathVariable Long id) {
		return disciplineService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
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
	public ResponseEntity<Discipline> patch(@PathVariable Long id, @RequestBody DisciplineDto disciplineDto) {
		return ResponseEntity.ok(disciplineService.patch(id, disciplineDto));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		disciplineService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

}
