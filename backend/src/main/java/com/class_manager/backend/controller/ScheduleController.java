package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.schedule.ScheduleDto;
import com.class_manager.backend.model.Schedule;
import com.class_manager.backend.service.ScheduleService;

import java.util.List;

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
	public ResponseEntity<List<Schedule>> findAll(Long semesterId) {
		return ResponseEntity.ok(scheduleService.findAll(semesterId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Schedule> findById(@PathVariable Long id) {
		return scheduleService.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping("/create-or-update")
	public ResponseEntity<Schedule> save(@RequestBody ScheduleDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.saveOrUpdate(dto));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		scheduleService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

}
