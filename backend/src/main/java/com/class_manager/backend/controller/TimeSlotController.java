package com.class_manager.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.model.time_slot.TimeSlotDto;
import com.class_manager.backend.model.TimeSlot;
import com.class_manager.backend.service.TimeSlotService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<TimeSlot> createOrUpdateTimeSlot(@RequestBody TimeSlotDto dto) {
        return ResponseEntity.ok(timeSlotService.createOrUpdateTimeSlot(dto));
    }

    @GetMapping("/{courseId}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<TimeSlot> getTimeSlotByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(timeSlotService.getByCourseId(courseId));
    }

}
