package com.class_manager.backend.utils;

import java.time.LocalDate;

public class SemesterUtils {

	public static int getCurrentYear() {
		return LocalDate.now().getYear();
	}

	public static int getCurrentSemesterNumber() {
		int month = LocalDate.now().getMonthValue();
		return (month <= 6) ? 1 : 2;
	}

	public static LocalDate getSemesterStartDate(int year, int semesterNumber) {
		return LocalDate.of(year, (semesterNumber == 1) ? 1 : 7, 1);
	}

	public static LocalDate getSemesterEndDate(int year, int semesterNumber) {
		return LocalDate.of(year, (semesterNumber == 1) ? 6 : 12, 30);
	}

}
