package com.class_manager.backend.dto.model.schedule;

import java.util.List;
import com.class_manager.backend.model.Schedule;

public record GenerateSchedulesResponseDto(
		List<Schedule> generatedSchedules,
		List<ScheduleGenerationError> errors) {
}
