package com.class_manager.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
    private Set<DayOfWeek> daysOfWeek; // Dias da semana (ex: Seg, Qua, Sex)

    @Column(nullable = false)
    private LocalTime startTime; // Horário de início (ex: 08:00)

    @Column(nullable = false)
    private LocalTime endTime; // Horário de término (ex: 12:00)

    @Column(nullable = false)
    private int lessonDurationMinutes; // Duração de cada aula (ex: 50 minutos)

    @OneToOne
    @JoinColumn(name = "course_id", nullable = false, unique = true)
	@JsonIgnore
    private Course course;
}
