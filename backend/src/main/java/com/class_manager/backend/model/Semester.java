package com.class_manager.backend.model;

import java.time.LocalDate;
import java.util.List;

import com.class_manager.backend.dto.model.semester.SemesterDto;
import com.class_manager.backend.enums.SemesterStatus;
import com.class_manager.backend.utils.SemesterUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "semester",
	uniqueConstraints = {
		@UniqueConstraint(columnNames = {"year", "semester"})
	}
)
@Data
@NoArgsConstructor
public class Semester {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private Integer year;

	@Column(nullable = false)
	private Integer semester;

	@Column(nullable = false)
	private LocalDate startDate;

	@Column(nullable = false)
	private LocalDate endDate;

	@Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SemesterStatus status;

	@OneToMany(mappedBy = "semester", orphanRemoval = true, cascade = CascadeType.REMOVE)
	@JsonIgnore
	private List<Schedule> schedules;

	public Semester(SemesterDto dto) {
		LocalDate startDate = dto.startDate();
		int semesterNumber = SemesterUtils.getSemesterNumber(startDate.getMonthValue());
		int yearNumber = startDate.getYear();

        this.name = "SEMESTRE-" + yearNumber + "/" + semesterNumber;
		this.status = SemesterStatus.ACTIVE;
		this.startDate = SemesterUtils.getSemesterStartDate(yearNumber, semesterNumber);
        this.endDate = SemesterUtils.getSemesterEndDate(yearNumber, semesterNumber);
        this.year = yearNumber;
        this.semester = semesterNumber;
	}

}
