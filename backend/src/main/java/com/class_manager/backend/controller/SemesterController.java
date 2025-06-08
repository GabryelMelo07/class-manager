package com.class_manager.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.model.semester.SemesterDto;
import com.class_manager.backend.model.Semester;
import com.class_manager.backend.service.SemesterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/semesters")
public class SemesterController {

	private final SemesterService semesterService;
	
	@GetMapping
	public ResponseEntity<Page<Semester>> findAll(Pageable pageable) {
		return ResponseEntity.ok(semesterService.findAll(pageable));
	}

	@PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<Semester> save(@RequestBody SemesterDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(semesterService.save(dto));
	}

	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Semester> patch(@PathVariable Long id, @RequestBody SemesterDto semesterDto) {
		return ResponseEntity.ok(semesterService.patch(id, semesterDto));
    }

	@DeleteMapping("/{id}")	
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		semesterService.delete(id);
		return ResponseEntity.noContent().build();
	}

}
