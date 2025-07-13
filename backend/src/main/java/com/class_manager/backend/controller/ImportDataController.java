package com.class_manager.backend.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.class_manager.backend.dto.ImportDataDto;
import com.class_manager.backend.dto.ImportResponse;
import com.class_manager.backend.dto.model.course.CourseDto;
import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.class_manager.backend.dto.model.group.GroupDto;
import com.class_manager.backend.dto.model.time_slot.TimeSlotDto;
import com.class_manager.backend.service.ClassRoomService;
import com.class_manager.backend.service.CourseService;
import com.class_manager.backend.service.DisciplineService;
import com.class_manager.backend.service.GroupService;
import com.class_manager.backend.service.SemesterService;
import com.class_manager.backend.service.TimeSlotService;
import com.class_manager.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/import-data")
public class ImportDataController {

	private final ObjectMapper objectMapper;
	private final UserService userService;
	private final SemesterService semesterService;
	private final CourseService courseService;
	private final TimeSlotService timeSlotService;
	private final ClassRoomService classRoomService;
	private final DisciplineService disciplineService;
	private final GroupService groupService;

	@PostMapping(path = "/json", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<?> save(@RequestParam MultipartFile file) {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body("File is empty");
		}

		log.info("Starting data import by JSON File...");

		List<String> importErrors = new ArrayList<>();

		try {
			String json = new String(file.getBytes(), StandardCharsets.UTF_8);
			ImportDataDto importData = objectMapper.readValue(json, ImportDataDto.class);

			// Create Users
			importData.users().forEach(user -> userService.register(user));

			// Create Semesters
			importData.semesters().forEach(semester -> semesterService.save(semester));

			// Create ClassRooms
			importData.classRooms().forEach(classRoom -> classRoomService.save(classRoom));

			// Create Courses
			importData.courses().forEach(course -> {
				String courseName = course.name();
				String coordinatorEmail = course.coordinatorEmail();
				Optional<UUID> coordinatorId = userService.findByEmail(coordinatorEmail);

				if (!coordinatorId.isPresent()) {
					String errorMessage = String.format(
							"Coordinator with email: %s, didnt exist, could not create Course: %s", coordinatorEmail,
							courseName);
					importErrors.add(errorMessage);
				}

				CourseDto courseDto = new CourseDto(courseName, course.abbreviation(), coordinatorId.get());
				courseService.save(courseDto);
			});

			// Create TimeSlots
			importData.timeSlots().forEach(timeSlot -> {
				String courseName = timeSlot.courseName();
				Optional<Long> courseId = courseService.findByName(courseName);

				if (!courseId.isPresent()) {
					String errorMessage = String.format(
							"Course with name: %s, didnt exist, could not create TimeSlot", courseName);
					importErrors.add(errorMessage);
				}

				TimeSlotDto timeSlotDto = new TimeSlotDto(
						timeSlot.daysOfWeek(), timeSlot.startTime(), timeSlot.endTime(),
						timeSlot.lessonDurationMinutes(), courseId.get());
				timeSlotService.createOrUpdateTimeSlot(timeSlotDto);
			});

			// Create Disciplines
			importData.disciplines().forEach(discipline -> {
				String disciplineName = discipline.name();
				String teacherEmail = discipline.teacherEmail();
				String courseName = discipline.courseName();
				Optional<Long> courseId = courseService.findByName(courseName);

				if (!courseId.isPresent()) {
					String errorMessage = String.format(
							"Course with name: %s, didnt exist, could not create Discipline: %s", courseName,
							disciplineName);
					importErrors.add(errorMessage);
				}

				Optional<UUID> teacherId = userService.findByEmail(teacherEmail);

				if (!teacherId.isPresent()) {
					String errorMessage = String.format(
							"Teacher with email: %s, didnt exist, could not create Discipline: %s", teacherEmail,
							disciplineName);
					importErrors.add(errorMessage);
				}

				DisciplineDto disciplineDto = new DisciplineDto(
						disciplineName, discipline.abbreviation(), discipline.credits(),
						courseId.get(), teacherId.get());
				disciplineService.save(disciplineDto);
			});

			// Create Groups
			importData.groups().forEach(group -> {
				String groupName = group.name();
				String disciplineName = group.disciplineName();
				String classRoomName = group.classRoomName();

				Optional<Long> disciplineId = disciplineService.findByName(disciplineName);

				if (!disciplineId.isPresent()) {
					String errorMessage = String.format(
							"Discipline with name: %s, didnt exist, could not create Group: %s", disciplineName,
							groupName);
					importErrors.add(errorMessage);
				}

				Optional<Long> classRoomId = classRoomService.findByName(classRoomName);

				if (!classRoomId.isPresent()) {
					String errorMessage = String.format(
							"ClassRoom with name: %s, didnt exist, could not create Group: %s", classRoomName,
							groupName);
					importErrors.add(errorMessage);
				}

				GroupDto groupDto = new GroupDto(
						groupName, group.abbreviation(), group.color(), group.semesterOfCourse(),
						disciplineId.get(), classRoomId.get());
				groupService.save(groupDto);
			});

			log.info("Ended JSON File import...");
			return ResponseEntity.ok().body(
				new ImportResponse(
					"Ended processing JSON File",
					importErrors
				)
			);
		} catch (IOException e) {
			String errorMessage = "Error when trying to proccess JSON file";
			log.error("{}: {}", errorMessage, e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(errorMessage);
		}
	}

}
