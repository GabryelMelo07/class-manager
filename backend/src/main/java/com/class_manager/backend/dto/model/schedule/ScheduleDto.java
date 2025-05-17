package com.class_manager.backend.dto.model.schedule;

import java.time.DayOfWeek;
import java.time.LocalTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record ScheduleDto(
		@NotNull DayOfWeek dayOfWeek,
		@Schema(type = "String", pattern = "HH:mm") LocalTime startTime,
		@Schema(type = "String", pattern = "HH:mm") LocalTime endTime,
		Long groupId,
		Long scheduleId) {
}
