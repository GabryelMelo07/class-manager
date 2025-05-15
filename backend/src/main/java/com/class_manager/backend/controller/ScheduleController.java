package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.schedule.ScheduleDto;
import com.class_manager.backend.model.Schedule;
import com.class_manager.backend.service.ScheduleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

	private final ScheduleService scheduleService;

	public ScheduleController(ScheduleService scheduleService) {
		this.scheduleService = scheduleService;
	}

	@GetMapping
	public ResponseEntity<Page<Schedule>> findAll(Pageable pageable) {
		return ResponseEntity.ok(scheduleService.findAll(pageable));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Schedule> findById(@PathVariable Long id) {
		return scheduleService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<Schedule> save(@RequestBody ScheduleDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.save(dto));
	}

	@Operation(summary = "Partially update a schedule", description = "Updates only the provided fields of a schedule. Requires groupId to be a valid Group.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Schedule successfully updated"),
			@ApiResponse(responseCode = "404", description = "Schedule or group not found"),
			@ApiResponse(responseCode = "400", description = "Invalid group provided")
	})
	@PatchMapping("/{id}")
	public ResponseEntity<Schedule> patch(@PathVariable Long id, @RequestBody ScheduleDto scheduleDto) {
		return ResponseEntity.ok(scheduleService.patch(id, scheduleDto));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		scheduleService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

}
