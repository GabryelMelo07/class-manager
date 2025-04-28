package com.class_manager.backend.dto.model.schedule;

import java.time.DayOfWeek;

public record ScheduleDto(DayOfWeek dayOfWeek, Integer startTime, Integer endTime, Long groupId) {
}
