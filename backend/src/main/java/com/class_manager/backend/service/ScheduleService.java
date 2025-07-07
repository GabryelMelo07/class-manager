package com.class_manager.backend.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.schedule.CopySchedulesDto;
import com.class_manager.backend.dto.model.schedule.GenerateSchedulesDto;
import com.class_manager.backend.dto.model.schedule.GenerateSchedulesResponseDto;
import com.class_manager.backend.dto.model.schedule.ScheduleDto;
import com.class_manager.backend.dto.model.schedule.ScheduleGenerationError;
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

	/**
	 * Retrieves all schedules for a specific course and semester.
	 *
	 * @param semesterId the ID of the semester
	 * @param courseId   the ID of the course
	 * @return a list of matching schedules
	 */
	public List<Schedule> findAll(Long semesterId, Long courseId) {
		return scheduleRepository.findSchedulesBySemesterAndCourse(semesterId, courseId);
	}

	public List<Schedule> findAllPublicSchedules() {
		Semester semester = semesterService.findActualSemester();
		return scheduleRepository.findSchedulesBySemester(semester.getId());
	}

	/**
	 * Retrieves a schedule by its unique identifier.
	 *
	 * @param id the schedule ID
	 * @return an Optional containing the schedule if found, otherwise empty
	 */
	public Optional<Schedule> findById(Long id) {
		return scheduleRepository.findById(id);
	}

	/**
	 * Retrieves all schedules associated with a specific teacher for a given
	 * semester.
	 *
	 * @param semesterId the ID of the semester
	 * @param teacherId  the UUID of the teacher
	 * @return a list of schedules for the teacher
	 */
	public List<Schedule> findByTeacher(Long semesterId, UUID teacherId) {
		return scheduleRepository.findSchedulesBySemesterAndTeacher(semesterId, teacherId);
	}

	/**
	 * Validates a schedule for conflicts and save to the database if valid.
	 *
	 * @param schedule the schedule to validate and save
	 * @return the saved schedule
	 * @throws InvalidScheduleException if any validation fails
	 */
	public Schedule validateAndSave(Schedule schedule) {
		validateNoConflicts(schedule);
		return scheduleRepository.save(schedule);
	}

	/**
	 * Creates or updates a schedule from a DTO. If an ID is provided, it updates
	 * the
	 * existing schedule. Otherwise, it creates a new schedule.
	 *
	 * @param dto the data transfer object containing schedule data
	 * @return the saved or updated schedule
	 * @throws EntityNotFoundException if the referenced group or schedule is not
	 *                                 found
	 */
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

	/**
	 * Copies schedules from one semester to another for a specific course.
	 * Existing schedules in the destination semester are removed.
	 *
	 * @param dto the DTO containing source and destination semester and course IDs
	 * @return a list of copied schedules
	 */
	public List<Schedule> copySchedulesBySemesterAndCourse(CopySchedulesDto dto) {
		findAndDeleteAllSchedulesBySemesterAndCourse(dto.toSemesterId(), dto.courseId());

		List<Schedule> schedulesToBeCopied = scheduleRepository.findSchedulesBySemesterAndCourse(dto.fromSemesterId(),
				dto.courseId());
		List<Schedule> copiedSchedules = new ArrayList<>();
		Semester semester = semesterService.findAndValidateSemesterById(dto.toSemesterId());

		for (Schedule fromSchedule : schedulesToBeCopied) {
			Schedule toSchedule = new Schedule(fromSchedule);
			toSchedule.setSemester(semester);
			copiedSchedules.add(validateAndSave(toSchedule));
		}

		return copiedSchedules;
	}

	/**
	 * Automatically generates schedules for all groups in a course and semester
	 * based on the available time slots and lesson durations.
	 *
	 * Generation uses 3 strategies in order:
	 * <ul>
	 * <li>1. Try to allocate all credits in a single day</li>
	 * <li>2. Try to split credits into two different days</li>
	 * <li>3. Distribute credits across multiple days</li>
	 * </ul>
	 *
	 * @param dto the DTO with semester and course IDs
	 * @return a response containing the generated schedules and any errors
	 */
	public GenerateSchedulesResponseDto generateSchedulesForCourseAndSemester(GenerateSchedulesDto dto) {
		Semester semester = semesterService.findAndValidateSemesterById(dto.semesterId());
		TimeSlot timeSlot = timeSlotRepository.findByCourseIdWithDays(dto.courseId())
				.orElseThrow(() -> new EntityNotFoundException("Time Slot Not Found."));

		findAndDeleteAllSchedulesBySemesterAndCourse(dto.semesterId(), dto.courseId());

		List<Group> groups = groupRepository.findAllByCourse(dto.courseId());
		List<Schedule> generatedSchedules = new ArrayList<>();
		List<ScheduleGenerationError> errors = new ArrayList<>();

		groups.sort(Comparator.comparingInt(group -> {
			Integer credits = group.getDiscipline().getCredits();
			return credits != null ? -credits : 0;
		}));

		List<LocalTime> availableSlots = calculateAvailableTimeSlots(timeSlot);
		Map<DayOfWeek, List<LocalTime>> dayAvailabilityMap = new HashMap<>();
		List<DayOfWeek> orderedDays = new ArrayList<>(timeSlot.getDaysOfWeek());
		orderedDays.sort(Comparator.comparingInt(DayOfWeek::getValue));

		for (DayOfWeek day : timeSlot.getDaysOfWeek()) {
			dayAvailabilityMap.put(day, new ArrayList<>(availableSlots));
		}

		for (Group group : groups) {
			int creditsToSchedule = group.getDiscipline().getCredits();
			int scheduled = 0;
			int attempts = 0;
			final int MAX_ATTEMPTS = creditsToSchedule * 100;

			// Strategy 1: Try to allocate all credits on the same day
			boolean strategy1Success = tryScheduleInOneDay(group, semester, timeSlot,
					dayAvailabilityMap, creditsToSchedule, generatedSchedules, orderedDays);

			if (strategy1Success) {
				continue;
			}

			// Strategy 2: Try to allocate credits across two days (half each)
			if (creditsToSchedule >= 2) {
				int creditsPerDay = (int) Math.ceil(creditsToSchedule / 2.0);
				boolean strategy2Success = tryScheduleInTwoDays(group, semester, timeSlot,
						dayAvailabilityMap, creditsPerDay, generatedSchedules, orderedDays);

				if (strategy2Success) {
					continue;
				}
			}

			// Strategy 3: Allocate credits across multiple days (1 credit per day)
			while (scheduled < creditsToSchedule && attempts < MAX_ATTEMPTS) {
				attempts++;
				DayOfWeek day = findBestDayForGroup(group, dayAvailabilityMap, timeSlot, orderedDays);

				Schedule newSchedule = createRandomScheduleOnDay(group, semester, timeSlot, dayAvailabilityMap, day);

				try {
					Schedule savedSchedule = validateAndSave(newSchedule);
					generatedSchedules.add(savedSchedule);
					scheduled++;

					dayAvailabilityMap.get(day).remove(newSchedule.getStartTime());
				} catch (InvalidScheduleException e) {
					log.error("Error scheduling class for group: " + group.getName(), e);
				}
			}

			if (scheduled < creditsToSchedule) {
				errors.add(new ScheduleGenerationError(
						group.getId(), group.getName(),
						"Scheduled only " + scheduled + "/" + creditsToSchedule + " credits"));
			}
		}

		return new GenerateSchedulesResponseDto(generatedSchedules, errors);
	}

	/**
	 * Deletes a schedule by its ID.
	 *
	 * @param id the ID of the schedule to delete
	 */
	public void deleteById(Long id) {
		scheduleRepository.deleteById(id);
	}

	// ──────────────────────── Private Methods ──────────────────────── //

	/**
	 * Calculates the end time for a schedule based on its start time and the lesson
	 * duration
	 * defined in the course's TimeSlot.
	 *
	 * @param schedule the schedule to calculate end time for
	 * @return the calculated end time
	 */
	private LocalTime getScheduleEndTimeFromLessonDuration(Schedule schedule) {
		Long courseId = schedule.getGroup().getDiscipline().getCourse().getId();

		TimeSlot timeSlot = timeSlotRepository.findByCourseId(courseId)
				.orElseThrow(() -> new InvalidScheduleException(
						"Course with id:" + courseId + " does not have a TimeSlot configured"));

		LocalTime endTime = schedule.getStartTime().plusMinutes(timeSlot.getLessonDurationMinutes());

		return endTime;
	}

	/**
	 * Validates if the schedule respects the course's configured TimeSlot
	 * constraints.
	 *
	 * @param schedule the schedule to validate
	 * @throws InvalidScheduleException if the schedule is outside allowed time or
	 *                                  day range
	 */
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

	/**
	 * Validates if the teacher is available at the given time.
	 *
	 * @param schedule the schedule to validate
	 * @throws InvalidScheduleException if the teacher already has a class at that
	 *                                  time
	 */
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

	/**
	 * Validates if the classroom is available at the given time.
	 *
	 * @param schedule the schedule to validate
	 * @throws InvalidScheduleException if the classroom is already occupied
	 */
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

	/**
	 * Validates if the group does not already have a schedule at the same time.
	 *
	 * @param schedule the schedule to validate
	 * @throws InvalidScheduleException if the group already has a schedule at that
	 *                                  time
	 */
	private void validateGroupAvailability(Schedule schedule) {
		Long groupId = schedule.getGroup().getId();

		boolean hasConflict = scheduleRepository.existsByGroupAndTime(
				groupId,
				schedule.getSemesterId(),
				schedule.getDayOfWeek(),
				schedule.getStartTime(),
				schedule.getEndTime(),
				schedule.getId());

		if (hasConflict) {
			throw new InvalidScheduleException("Group already has an schedule at this time");
		}
	}

	/**
	 * Runs all conflict validations for a schedule.
	 *
	 * @param schedule the schedule to validate
	 */
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

	/**
	 * Tries to allocate all lesson credits of a group on the same day.
	 *
	 * @param group              the group
	 * @param semester           the semester
	 * @param timeSlot           the time slot configuration
	 * @param dayAvailabilityMap map of available time slots per day
	 * @param creditsToSchedule  number of credits to schedule
	 * @param generatedSchedules the result list where valid schedules are added
	 * @param orderedDays        days of the week ordered by priority
	 * @return true if successful, false otherwise
	 */
	private boolean tryScheduleInOneDay(Group group, Semester semester, TimeSlot timeSlot,
			Map<DayOfWeek, List<LocalTime>> dayAvailabilityMap, int creditsToSchedule,
			List<Schedule> generatedSchedules, List<DayOfWeek> orderedDays) {
		for (DayOfWeek day : orderedDays) {
			if (!dayAvailabilityMap.containsKey(day))
				continue;

			List<LocalTime> availableOnDay = new ArrayList<>(dayAvailabilityMap.get(day));
			if (availableOnDay.size() < creditsToSchedule)
				continue;

			List<Schedule> tempSchedules = new ArrayList<>();
			boolean success = true;

			for (int i = 0; i < creditsToSchedule; i++) {
				LocalTime slot = availableOnDay.get(i);
				Schedule schedule = new Schedule();
				schedule.setGroup(group);
				schedule.setSemester(semester);
				schedule.setDayOfWeek(day);
				schedule.setStartTime(slot);
				schedule.setEndTime(slot.plusMinutes(timeSlot.getLessonDurationMinutes()));

				try {
					// Validação em memória
					validateNoConflicts(schedule);
					tempSchedules.add(schedule);
				} catch (InvalidScheduleException e) {
					success = false;
					break;
				}
			}

			if (success) {
				// Se todas as validações passaram, salva efetivamente
				for (Schedule s : tempSchedules) {
					Schedule saved = scheduleRepository.save(s);
					generatedSchedules.add(saved);
					dayAvailabilityMap.get(day).remove(s.getStartTime());
				}
				return true;
			}
		}
		return false;
	}

	/**
	 * Tries to split the group's credits between two different days.
	 *
	 * @param group              the group
	 * @param semester           the semester
	 * @param timeSlot           the time slot configuration
	 * @param dayAvailabilityMap map of available time slots per day
	 * @param creditsPerDay      how many credits to allocate each day
	 * @param generatedSchedules result list where valid schedules are added
	 * @param orderedDays        ordered days of the week
	 * @return true if successful, false otherwise
	 */
	private boolean tryScheduleInTwoDays(Group group, Semester semester, TimeSlot timeSlot,
			Map<DayOfWeek, List<LocalTime>> dayAvailabilityMap, int creditsPerDay,
			List<Schedule> generatedSchedules, List<DayOfWeek> orderedDays) {
		List<DayOfWeek> days = new ArrayList<>(dayAvailabilityMap.keySet());
		Collections.shuffle(days);

		for (int i = 0; i < orderedDays.size(); i++) {
			DayOfWeek day1 = orderedDays.get(i);

			if (!dayAvailabilityMap.containsKey(day1))
				continue;

			for (int j = i + 1; j < orderedDays.size(); j++) {
				DayOfWeek day2 = orderedDays.get(j);

				if (!dayAvailabilityMap.containsKey(day2))
					continue;

				if (dayAvailabilityMap.get(day1).size() < creditsPerDay ||
						dayAvailabilityMap.get(day2).size() < creditsPerDay) {
					continue;
				}

				List<Schedule> tempSchedules = new ArrayList<>();
				boolean success = true;

				for (int k = 0; k < creditsPerDay; k++) {
					if (k >= dayAvailabilityMap.get(day1).size())
						break;

					LocalTime slot = dayAvailabilityMap.get(day1).get(k);

					Schedule schedule = new Schedule();
					schedule.setGroup(group);
					schedule.setSemester(semester);
					schedule.setDayOfWeek(day1);
					schedule.setStartTime(slot);
					schedule.setEndTime(slot.plusMinutes(timeSlot.getLessonDurationMinutes()));

					try {
						validateNoConflicts(schedule);
						tempSchedules.add(schedule);
					} catch (InvalidScheduleException e) {
						success = false;
						break;
					}
				}

				if (!success)
					continue;

				for (int k = 0; k < creditsPerDay; k++) {
					if (k >= dayAvailabilityMap.get(day2).size())
						break;

					LocalTime slot = dayAvailabilityMap.get(day2).get(k);

					Schedule schedule = new Schedule();
					schedule.setGroup(group);
					schedule.setSemester(semester);
					schedule.setDayOfWeek(day2);
					schedule.setStartTime(slot);
					schedule.setEndTime(slot.plusMinutes(timeSlot.getLessonDurationMinutes()));

					try {
						validateNoConflicts(schedule);
						tempSchedules.add(schedule);
					} catch (InvalidScheduleException e) {
						success = false;
						break;
					}
				}

				if (success && tempSchedules.size() >= group.getDiscipline().getCredits()) {
					for (Schedule s : tempSchedules) {
						Schedule saved = scheduleRepository.save(s);
						generatedSchedules.add(saved);
						dayAvailabilityMap.get(s.getDayOfWeek()).remove(s.getStartTime());
					}

					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Finds the most suitable day to schedule a lesson for a group,
	 * prioritizing days already used or with more availability.
	 *
	 * @param group              the group
	 * @param dayAvailabilityMap map of available time slots
	 * @param timeSlot           the time slot configuration
	 * @param orderedDays        ordered list of days of the week
	 * @return the best available day
	 */
	private DayOfWeek findBestDayForGroup(Group group, Map<DayOfWeek, List<LocalTime>> dayAvailabilityMap,
			TimeSlot timeSlot, List<DayOfWeek> orderedDays) {
		List<Schedule> groupSchedules = scheduleRepository.findByGroupId(group.getId());

		Set<DayOfWeek> groupDays = groupSchedules.stream()
				.map(Schedule::getDayOfWeek)
				.collect(Collectors.toSet());

		for (DayOfWeek day : orderedDays) {
			if (groupDays.contains(day) && dayAvailabilityMap.containsKey(day)
					&& !dayAvailabilityMap.get(day).isEmpty()) {
				return day;
			}
		}

		for (DayOfWeek day : orderedDays) {
			if (dayAvailabilityMap.containsKey(day) && !dayAvailabilityMap.get(day).isEmpty()) {
				return day;
			}
		}

		return orderedDays.isEmpty() ? DayOfWeek.MONDAY : orderedDays.get(0);
	}

	/**
	 * Creates a schedule with a random start time on a given day.
	 *
	 * @param group              the group
	 * @param semester           the semester
	 * @param timeSlot           the time slot configuration
	 * @param dayAvailabilityMap map of available slots
	 * @param day                the selected day
	 * @return the new schedule
	 */
	private Schedule createRandomScheduleOnDay(Group group, Semester semester, TimeSlot timeSlot,
			Map<DayOfWeek, List<LocalTime>> dayAvailabilityMap, DayOfWeek day) {
		List<LocalTime> availableOnDay = dayAvailabilityMap.get(day);

		if (availableOnDay.isEmpty()) {
			throw new IllegalStateException("No slots available for " + day);
		}

		int randomIndex = new Random().nextInt(availableOnDay.size());
		LocalTime slot = availableOnDay.get(randomIndex);

		Schedule schedule = new Schedule();
		schedule.setGroup(group);
		schedule.setSemester(semester);
		schedule.setDayOfWeek(day);
		schedule.setStartTime(slot);
		schedule.setEndTime(slot.plusMinutes(timeSlot.getLessonDurationMinutes()));

		return schedule;
	}

	/**
	 * Calculates all available time slots within a given TimeSlot configuration.
	 *
	 * @param timeSlot the configuration of available start/end times and lesson
	 *                 duration
	 * @return list of available starting times
	 */
	private List<LocalTime> calculateAvailableTimeSlots(TimeSlot timeSlot) {
		List<LocalTime> availableSlots = new ArrayList<>();
		LocalTime current = timeSlot.getStartTime();

		int duration = timeSlot.getLessonDurationMinutes();

		while (!current.plusMinutes(duration).isAfter(timeSlot.getEndTime())) {
			availableSlots.add(current);
			current = current.plusMinutes(duration);
		}

		return availableSlots;
	}

	/**
	 * Deletes all schedules for a specific semester and course.
	 *
	 * @param semesterId the ID of the semester
	 * @param courseId   the ID of the course
	 */
	private void findAndDeleteAllSchedulesBySemesterAndCourse(Long semesterId, Long courseId) {
		List<Schedule> schedules = scheduleRepository.findSchedulesBySemesterAndCourse(semesterId, courseId);
		scheduleRepository.deleteAll(schedules);
		log.info("Deleted {} schedules for semester {} and course {}", schedules.size(), semesterId, courseId);
	}
	
}
