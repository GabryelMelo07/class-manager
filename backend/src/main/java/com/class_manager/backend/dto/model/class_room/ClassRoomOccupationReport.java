package com.class_manager.backend.dto.model.class_room;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record ClassRoomOccupationReport(
    String classRoomName,
    DayOfWeek dayOfWeek,
    LocalTime startTime,
    LocalTime endTime,
    String groupName,
    String disciplineName
) {
}
