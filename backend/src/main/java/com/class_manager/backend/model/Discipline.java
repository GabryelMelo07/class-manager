package com.class_manager.backend.model;

import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "discipline")
@Data
@NoArgsConstructor
public class Discipline {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(nullable = false, length = 50)
	private String name;
	
	@Column(nullable = false, length = 15)
	private String abbreviation;

	@Column(nullable = false)
	private Integer credits;

	@Column(nullable = false)
	private Boolean active = true;

	@ManyToOne(optional = false)
	@JoinColumn(name = "course_id", nullable = false)
	@JsonIgnoreProperties({"disciplines"})
	private Course course;

	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name = "teacher_id")
	@JsonIgnoreProperties({"coordinatedCourse", "teachingCourses", "disciplines", "roles"})
	private User teacher;
	
	public Discipline(DisciplineDto createDisciplineDto) {
		this.name = createDisciplineDto.name();
		this.abbreviation = createDisciplineDto.abbreviation();
		this.credits = createDisciplineDto.credits();
	}
	
}
