package com.class_manager.backend.model;

import java.util.ArrayList;
import java.util.List;

import com.class_manager.backend.dto.model.course.CourseDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
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

	@OneToOne
    @JoinColumn(name = "coordinator_id", unique = true)
    @JsonIgnoreProperties({"coordinatedCourse", "teachingCourses", "disciplines", "roles"})
    private User coordinator;

	@OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonIgnoreProperties({"course"})
	private List<Discipline> disciplines;

	public Course(CourseDto createCourseDto) {
		this.name = createCourseDto.name();
		this.coordinator = null;
		this.disciplines = new ArrayList<>();
	}
	
}
