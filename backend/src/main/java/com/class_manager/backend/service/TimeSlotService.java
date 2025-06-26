package com.class_manager.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.time_slot.TimeSlotDto;
import com.class_manager.backend.dto.model.time_slot.UpdateTimeSlotDto;
import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.TimeSlot;
import com.class_manager.backend.repository.CourseRepository;
import com.class_manager.backend.repository.TimeSlotRepository;
import com.class_manager.backend.utils.Patcher;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimeSlotService {

	private final TimeSlotRepository timeSlotRepository;
	private final CourseRepository courseRepository;

	public Page<TimeSlot> findAll(Pageable pageable) {
		return timeSlotRepository.findAll(pageable);
	}

	public TimeSlot getByCourseId(Long courseId) {
		return timeSlotRepository.findByCourseId(courseId)
				.orElseThrow(() -> new EntityNotFoundException("Time Slot not found with courseId: " + courseId));
	}

	public TimeSlot createOrUpdateTimeSlot(TimeSlotDto dto) {
		Course course = courseRepository.findById(dto.courseId())
				.orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + dto.courseId()));

		TimeSlot timeSlot = timeSlotRepository.findByCourseId(dto.courseId())
				.orElse(new TimeSlot());

		timeSlot.setDaysOfWeek(dto.daysOfWeek());
		timeSlot.setStartTime(dto.startTime());
		timeSlot.setEndTime(dto.endTime());
		timeSlot.setLessonDurationMinutes(dto.lessonDurationMinutes());
		timeSlot.setCourse(course);

		return timeSlotRepository.save(timeSlot);
	}

	public TimeSlot patch(Long timeSlotId, UpdateTimeSlotDto timeSlotDto) {
		TimeSlot partialTimeSlot = new TimeSlot(timeSlotDto);

		TimeSlot existingTimeSlot = timeSlotRepository.findById(timeSlotId)
				.orElseThrow(() -> new EntityNotFoundException("TimeSlot not found."));

		try {
			Patcher.patch(existingTimeSlot, partialTimeSlot);
			return timeSlotRepository.save(existingTimeSlot);
		} catch (Exception e) {
			throw new RuntimeException("Failed to patch TimeSlot", e);
		}
	}

}
