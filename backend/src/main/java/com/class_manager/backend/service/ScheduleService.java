package com.class_manager.backend.service;

import java.time.Duration;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.schedule.ScheduleDto;
import com.class_manager.backend.exceptions.InvalidScheduleException;
import com.class_manager.backend.model.ClassRoom;
import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.Group;
import com.class_manager.backend.model.Schedule;
import com.class_manager.backend.model.Semester;
import com.class_manager.backend.model.TimeSlot;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.GroupRepository;
import com.class_manager.backend.repository.ScheduleRepository;
import com.class_manager.backend.repository.TimeSlotRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

	private final ScheduleRepository scheduleRepository;
	private final GroupRepository groupRepository;
	private final TimeSlotRepository timeSlotRepository;
	private final SemesterService semesterService;

	public List<Schedule> findAll(Long semesterId, Long courseId) {
		return scheduleRepository.findSchedulesBySemesterAndCourse(semesterId, courseId);
	}

	public Optional<Schedule> findById(Long id) {
		return scheduleRepository.findById(id);
	}

	public List<Schedule> findByTeacher(Long semesterId, UUID teacherId) {
		return scheduleRepository.findSchedulesBySemesterAndTeacher(semesterId, teacherId);
	}

	public Schedule validateAndSave(Schedule schedule) {
		validateNoConflicts(schedule);
		return scheduleRepository.save(schedule);
	}

	public Schedule saveOrUpdate(ScheduleDto dto) {
		Schedule schedule;

		if (dto.scheduleId() != null) {
			schedule = scheduleRepository.findById(dto.scheduleId())
					.orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + dto.scheduleId()));

			schedule.setDayOfWeek(dto.dayOfWeek());
			schedule.setStartTime(dto.startTime());
		} else {
			Group group = groupRepository.findById(dto.groupId())
					.orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + dto.groupId()));

			Semester semester = semesterService.findAndValidateSemesterById(dto.semesterId());

			schedule = new Schedule(dto);
			schedule.setGroup(group);
			schedule.setSemester(semester);
		}
		
		schedule.setEndTime(getScheduleEndTimeFromLessonDuration(schedule));
		return validateAndSave(schedule);
	}

	public void deleteById(Long id) {
		scheduleRepository.deleteById(id);
	}

	private LocalTime getScheduleEndTimeFromLessonDuration(Schedule schedule) {
		Long courseId = schedule.getGroup().getDiscipline().getCourse().getId();
		
		TimeSlot timeSlot = timeSlotRepository.findByCourseId(courseId)
				.orElseThrow(() -> new InvalidScheduleException(
						"Course with id:" + courseId + " does not have a TimeSlot configured"));

		LocalTime endTime = schedule.getStartTime().plusMinutes(timeSlot.getLessonDurationMinutes());

		return endTime;
	}

	private void validateScheduleAgainstTimeSlot(Schedule schedule) {
		Course course = schedule.getGroup().getDiscipline().getCourse();
		Long courseId = course.getId();

		TimeSlot timeSlot = timeSlotRepository.findByCourseId(courseId)
				.orElseThrow(() -> new InvalidScheduleException(
						"Course with id:" + courseId + " does not have a TimeSlot configured"));

		// Day of Week Validation
		if (!timeSlot.getDaysOfWeek().contains(schedule.getDayOfWeek())) {
			throw new InvalidScheduleException("Day of the week not allowed for this course");
		}

		// Time Validation
		if (schedule.getStartTime().isBefore(timeSlot.getStartTime())) {
			throw new InvalidScheduleException("Start time outside of TimeSlot");
		}

		if (schedule.getEndTime().isAfter(timeSlot.getEndTime())) {
			throw new InvalidScheduleException("End time outside TimeSlot");
		}

		// Lesson Duration Validation
		long duration = Duration.between(schedule.getStartTime(), schedule.getEndTime()).toMinutes();
		if (duration != timeSlot.getLessonDurationMinutes()) {
			throw new InvalidScheduleException("Lesson duration does not match TimeSlot");
		}
	}

	private void validateTeacherAvailability(Schedule schedule) {
		User teacher = schedule.getGroup().getDiscipline().getTeacher();
		if (teacher == null)
			throw new IllegalArgumentException("Invalid Teacher");

		boolean hasConflict = scheduleRepository.existsByTeacherAndTime(
				teacher.getId(),
				schedule.getSemesterId(),
				schedule.getDayOfWeek(),
				schedule.getStartTime(),
				schedule.getEndTime(),
				schedule.getId() // To ignore own registration in updates
		);

		if (hasConflict) {
			throw new InvalidScheduleException("Teacher already has a lesson scheduled for this time");
		}
	}

	private void validateClassRoomAvailability(Schedule schedule) {
		ClassRoom classRoom = schedule.getGroup().getClassRoom();
		if (classRoom == null)
			throw new IllegalArgumentException("Invalid Class Room");

		boolean hasConflict = scheduleRepository.existsByClassRoomAndTime(
				classRoom.getId(),
				schedule.getSemesterId(),
				schedule.getDayOfWeek(),
				schedule.getStartTime(),
				schedule.getEndTime(),
				schedule.getId() // To ignore own registration in updates
		);

		if (hasConflict) {
			throw new InvalidScheduleException("Class Room already occupied at this time");
		}
	}

	private void validateGroupAvailability(Schedule schedule) {
		Long groupId = schedule.getGroup().getId();

		boolean hasConflict = scheduleRepository.existsByGroupAndTime(
				groupId,
				schedule.getSemesterId(),
				schedule.getDayOfWeek(),
				schedule.getStartTime(),
				schedule.getEndTime(),
				schedule.getId()
		);

		if (hasConflict) {
			throw new InvalidScheduleException("Group already has an schedule at this time");
		}
	}

	private void validateNoConflicts(Schedule schedule) {
		// Case 1: Course TimeSlot conflict
		validateScheduleAgainstTimeSlot(schedule);

		// Case 2: Teacher conflict
		validateTeacherAvailability(schedule);

		// Case 3: Class Room conflict
		validateClassRoomAvailability(schedule);

		// Case 4: Group already has a Schedule at the same time conflict
		validateGroupAvailability(schedule);
	}

}
