package com.class_manager.backend.model;

import com.class_manager.backend.dto.model.group.GroupDto;

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
@Table(name = "student_group") // Group is a reserved word in SQL
@Data
@NoArgsConstructor
public class Group {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String name;

	@Column(nullable = false, length = 15)
	private String abbreviation;

	@Column
	private Integer semesterOfCourse;

	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name = "discipline_id")
	private Discipline discipline;

	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name = "class_room_id")
	private ClassRoom classRoom;

	@Column
	private String color;

	public Group(GroupDto dto) {
		this.name = dto.name();
		this.abbreviation = dto.abbreviation();
		this.color = dto.color();
		this.semesterOfCourse = dto.semesterOfCourse();
	}

}
