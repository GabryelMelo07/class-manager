package com.class_manager.backend.model;

import java.util.List;

import com.class_manager.backend.dto.model.course.CourseDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "course")
@Data
@NoArgsConstructor
public class Course {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

	@Column(nullable = false, unique = true)
    private String name;
	
	@Column(nullable = false, length = 10)
	private String abbreviation;

	@Column(nullable = false)
	private Boolean active = true;

	@OneToOne
    @JoinColumn(name = "coordinator_id", unique = true)
    @JsonIgnoreProperties({"coordinatedCourse", "teachingCourses", "disciplines", "roles"})
    private User coordinator;

	@OneToMany(mappedBy = "course")
	@JsonIgnoreProperties({"course"})
	private List<Discipline> disciplines;

	@OneToOne(mappedBy = "course")
	@JsonIgnoreProperties({"course"})
	private TimeSlot timeSlot;

	public Course(CourseDto dto) {
		this.name = dto.name();
		this.abbreviation = dto.abbreviation();
	}
	
}
