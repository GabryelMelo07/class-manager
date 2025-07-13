package com.class_manager.backend.dto;

import java.util.List;

import com.class_manager.backend.dto.auth.CreateUserDto;
import com.class_manager.backend.dto.model.class_room.ClassRoomDto;
import com.class_manager.backend.dto.model.course.ImportCourseDto;
import com.class_manager.backend.dto.model.discipline.ImportDisciplineDto;
import com.class_manager.backend.dto.model.group.ImportGroupDto;
import com.class_manager.backend.dto.model.semester.SemesterDto;
import com.class_manager.backend.dto.model.time_slot.ImportTimeSlotDto;

public record ImportDataDto(
	List<CreateUserDto> users,
	List<SemesterDto> semesters,
	List<ImportCourseDto> courses,
	List<ImportTimeSlotDto> timeSlots,
	List<ClassRoomDto> classRooms,
	List<ImportDisciplineDto> disciplines,
	List<ImportGroupDto> groups
) {
}
