package com.class_manager.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

import com.class_manager.backend.dto.model.schedule.ScheduleDto;

@Entity
@Table(name = "schedule", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"class_room_id", "day_of_week", "start_time", "end_time"})
    }
)
@Data
@NoArgsConstructor
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day_of_week", nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

	@ManyToOne(optional = false, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "group_id")
    private Group group;

    public Schedule(ScheduleDto dto) {
        this.dayOfWeek = dto.dayOfWeek();
        this.startTime = LocalTime.of(dto.startTime(), 0, 0);
        this.endTime = LocalTime.of(dto.endTime(), 0, 0);
    }

}
