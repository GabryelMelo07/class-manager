package com.class_manager.backend.dto.model.time_slot;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

import com.class_manager.backend.decorators.ValidString;

import jakarta.validation.constraints.Positive;

public record ImportTimeSlotDto(
    Set<DayOfWeek> daysOfWeek,
    LocalTime startTime,
    LocalTime endTime,
    @Positive Integer lessonDurationMinutes,
	@ValidString String courseName
) {}
