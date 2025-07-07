package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.schedule.CopySchedulesDto;
import com.class_manager.backend.dto.model.schedule.GenerateSchedulesDto;
import com.class_manager.backend.dto.model.schedule.GenerateSchedulesResponseDto;
import com.class_manager.backend.dto.model.schedule.ScheduleDto;
import com.class_manager.backend.model.Schedule;
import com.class_manager.backend.service.ScheduleService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

	private final ScheduleService scheduleService;

	@GetMapping
	public ResponseEntity<List<Schedule>> findAll(Long semesterId, Long courseId) {
		return ResponseEntity.ok(scheduleService.findAll(semesterId, courseId));
	}

	@GetMapping("/public")
	public ResponseEntity<List<Schedule>> findAllPublicActualSchedules() {
		return ResponseEntity.ok(scheduleService.findAllPublicSchedules());
	}

	@GetMapping("/semester/{semesterId}/teacher/{teacherId}")
	public ResponseEntity<List<Schedule>> findByTeacher(@PathVariable Long semesterId, @PathVariable UUID teacherId) {
		return ResponseEntity.ok(scheduleService.findByTeacher(semesterId, teacherId));
	}

	@PostMapping("/create-or-update")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<Schedule> save(@RequestBody ScheduleDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.saveOrUpdate(dto));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		scheduleService.deleteById(id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/copy-schedules")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<List<Schedule>> copySchedules(@RequestBody CopySchedulesDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.copySchedulesBySemesterAndCourse(dto));
	}

	@PostMapping("/generate-schedules")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<GenerateSchedulesResponseDto> generateSchedules(@RequestBody GenerateSchedulesDto dto) {
		return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.generateSchedulesForCourseAndSemester(dto));
	}
	
}
