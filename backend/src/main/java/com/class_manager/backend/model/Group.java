package com.class_manager.backend.model;

import java.time.LocalDate;

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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

	@Column(nullable = false, length = 10)
	private String abbreviation;

	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name = "discipline_id")
	private Discipline discipline;

	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name = "class_room_id")
	private ClassRoom classRoom;

	@Column(nullable = false)
	@Min(1)
	@Max(2)
	private Integer semester;

	@Column(nullable = false)
	private Integer year;

	public Group(GroupDto createGroupDto) {
		this.name = createGroupDto.name();
		this.abbreviation = createGroupDto.abbreviation();
		this.semester = getActualSemester();
		this.year = LocalDate.now().getYear();
	}

	public static int getActualSemester() {
        int month = LocalDate.now().getMonthValue();
        return (month <= 6) ? 1 : 2;
    }

	public String getAbbreviatedName() {
		return String.format("%s-%d/%d", this.abbreviation, this.year, this.semester);
	}

}
