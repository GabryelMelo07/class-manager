package com.class_manager.backend.model;

import java.time.LocalDate;

import com.class_manager.backend.enums.SemesterStatus;
import com.class_manager.backend.utils.SemesterUtils;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Table(name = "semester",
	uniqueConstraints = {
		@UniqueConstraint(columnNames = {"year", "semester"})
	}
)
@Data
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

	public Semester() {
	}

	public static Semester createCurrentSemester() {
        int year = SemesterUtils.getCurrentYear();
        int semesterNumber = SemesterUtils.getCurrentSemesterNumber();
        
        Semester semester = new Semester();
        semester.name = "SEMESTRE-" + year + "/" + semesterNumber;
		semester.status = SemesterStatus.ACTIVE;
        semester.startDate = SemesterUtils.getSemesterStartDate(year, semesterNumber);
        semester.endDate = SemesterUtils.getSemesterEndDate(year, semesterNumber);
        semester.year = year;
        semester.semester = semesterNumber;

        return semester;
    }

}
