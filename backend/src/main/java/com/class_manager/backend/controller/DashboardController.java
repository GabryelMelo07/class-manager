package com.class_manager.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.class_manager.backend.dto.auth.UserResponseDto;
import com.class_manager.backend.dto.model.class_room.ClassRoomOccupationReport;
import com.class_manager.backend.dto.model.course.CourseDisciplineWorkloadReport;
import com.class_manager.backend.dto.model.teacher.TeacherWorkloadReport;
import com.class_manager.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

	private final DashboardService dashboardService;

	@GetMapping("/teacher-workload")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public List<TeacherWorkloadReport> getTeacherWorkloadReport(@RequestParam Long semesterId) {
		return dashboardService.getTeacherWorkloadReport(semesterId);
	}

	@GetMapping("/unassigned-teachers")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public List<UserResponseDto> getUnassignedTeachersReport(@RequestParam Long semesterId) {
		return dashboardService.getUnassignedTeachersReport(semesterId);
	}

	@GetMapping("/course-discipline-workload")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public List<CourseDisciplineWorkloadReport> getCourseDisciplineWorkloadReport(@RequestParam Long semesterId) {
		return dashboardService.getCourseDisciplineWorkloadReport(semesterId);
	}

	@GetMapping("/class-room-occupation")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public List<ClassRoomOccupationReport> getClassRoomOccupationReport(@RequestParam Long semesterId) {
		return dashboardService.getClassRoomOccupationReport(semesterId);
	}

}
