package com.class_manager.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.model.Semester;
import com.class_manager.backend.service.SemesterService;

@RestController
@RequestMapping("/api/v1/semesters")
public class SemesterController {

	private final SemesterService semesterService;

	public SemesterController(SemesterService semesterService) {
		this.semesterService = semesterService;
	}
	
	@GetMapping
	public ResponseEntity<Page<Semester>> findAll(Pageable pageable) {
		return ResponseEntity.ok(semesterService.findAll(pageable));
	}
	
}
