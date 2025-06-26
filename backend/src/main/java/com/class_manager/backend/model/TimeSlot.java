package com.class_manager.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

import com.class_manager.backend.dto.model.time_slot.UpdateTimeSlotDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "time_slot")
@Data
@NoArgsConstructor
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "time_slot_days", joinColumns = @JoinColumn(name = "time_slot_id"))
    @Column(name = "day_of_week")
    private Set<DayOfWeek> daysOfWeek; // Days of the week (e.g. Mon, Wed, Fri)

    @Column(nullable = false)
    private LocalTime startTime; // Start time (e.g. 08:00)

    @Column(nullable = false)
    private LocalTime endTime; // End time (e.g. 12:00)

    @Column(nullable = false)
    private Integer lessonDurationMinutes; // Duration of each class (e.g. 50 minutes)

    @OneToOne
    @JoinColumn(name = "course_id", nullable = false, unique = true)
	@JsonIgnoreProperties({"id", "coordinator", "disciplines", "timeSlot"})
    private Course course;

	public TimeSlot(UpdateTimeSlotDto timeSlotDto) {
		this.daysOfWeek = timeSlotDto.daysOfWeek();
		this.startTime = timeSlotDto.startTime();
		this.endTime = timeSlotDto.endTime();
		this.lessonDurationMinutes = timeSlotDto.lessonDurationMinutes();
	}
}
