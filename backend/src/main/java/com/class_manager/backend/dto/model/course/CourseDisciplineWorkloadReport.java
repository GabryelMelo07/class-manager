package com.class_manager.backend.dto.model.course;

public record CourseDisciplineWorkloadReport(
    String courseName,
    String disciplineName,
    double totalHours
) {
}
