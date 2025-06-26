package com.class_manager.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.class_manager.backend.model.TimeSlot;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

	Optional<TimeSlot> findByCourseId(Long courseId);

	@Query("SELECT ts FROM TimeSlot ts JOIN FETCH ts.daysOfWeek WHERE ts.course.id = :courseId")
	Optional<TimeSlot> findByCourseIdWithDays(@Param("courseId") Long courseId);

}
