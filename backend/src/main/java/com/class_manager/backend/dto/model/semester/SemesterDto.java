package com.class_manager.backend.dto.model.semester;

import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;

public record SemesterDto(@FutureOrPresent LocalDate startDate) {
}
