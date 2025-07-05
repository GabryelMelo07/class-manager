package com.class_manager.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.auth.UserResponseDto;
import com.class_manager.backend.dto.model.class_room.ClassRoomOccupationReport;
import com.class_manager.backend.dto.model.course.CourseDisciplineWorkloadReport;
import com.class_manager.backend.dto.model.teacher.TeacherWorkloadReport;
import com.class_manager.backend.repository.ScheduleRepository;
import com.class_manager.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

	private final ScheduleRepository scheduleRepository;
	private final UserRepository userRepository;

	public List<TeacherWorkloadReport> getTeacherWorkloadReport(Long semesterId) {
		return scheduleRepository.findTeacherWorkloadBySemester(semesterId);
	}

	public List<UserResponseDto> getUnassignedTeachersReport(Long semesterId) {
		return userRepository.findUnassignedTeachersBySemester(semesterId)
				.stream()
				.map(user -> new UserResponseDto(user.getId(), user.getEmail(), user.getName(), user.getSurname(),
						user.getRoles()))
				.toList();
	}

	public List<CourseDisciplineWorkloadReport> getCourseDisciplineWorkloadReport(Long semesterId) {
		return scheduleRepository.findCourseDisciplineWorkloadBySemester(semesterId);
	}

	public List<ClassRoomOccupationReport> getClassRoomOccupationReport(Long semesterId) {
		return scheduleRepository.findClassRoomOccupationBySemester(semesterId);
	}

}
