package com.class_manager.backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.model.time_slot.TimeSlotDto;
import com.class_manager.backend.dto.model.time_slot.UpdateTimeSlotDto;
import com.class_manager.backend.model.TimeSlot;
import com.class_manager.backend.service.TimeSlotService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

	@GetMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Page<TimeSlot>> findAll(Pageable pageable) {
        return ResponseEntity.ok(timeSlotService.findAll(pageable));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<TimeSlot> getTimeSlotByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(timeSlotService.getByCourseId(courseId));
    }
	
    @PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<TimeSlot> createOrUpdateTimeSlot(@RequestBody TimeSlotDto dto) {
        return ResponseEntity.ok(timeSlotService.createOrUpdateTimeSlot(dto));
    }

	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<TimeSlot> patch(@PathVariable Long id, @RequestBody UpdateTimeSlotDto timeSlotDto) {
		return ResponseEntity.ok(timeSlotService.patch(id, timeSlotDto));
    }

}
