package com.class_manager.backend.dto.model.time_slot;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;

public record TimeSlotDto(
    Set<DayOfWeek> daysOfWeek,
    @Schema(type = "String", pattern = "HH:mm") LocalTime startTime,
    @Schema(type = "String", pattern = "HH:mm") LocalTime endTime,
    Integer lessonDurationMinutes,
	Long courseId
) {}
