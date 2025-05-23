package com.class_manager.backend.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.semester.SemesterDto;
import com.class_manager.backend.enums.SemesterStatus;
import com.class_manager.backend.exceptions.InvalidScheduleException;
import com.class_manager.backend.model.Semester;
import com.class_manager.backend.repository.SemesterRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SemesterService {

	private final SemesterRepository semesterRepository;

	public Page<Semester> findAll(Pageable pageable) {
		return semesterRepository.findAllOrderByStatusActive(pageable);
	}

	public Semester findAndValidateSemesterById(Long id) {
		Semester semester = semesterRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Semester not found with id: " + id));

		if (semester.getStatus() != SemesterStatus.ACTIVE) {
			throw new InvalidScheduleException("Cannot create schedule for a finalized semester");
		}

		if (semester.getEndDate().isBefore(LocalDate.now())) {
			semester.setStatus(SemesterStatus.FINALIZED);
			semesterRepository.save(semester);
			throw new InvalidScheduleException("Cannot create schedule for a finalized semester");
		}

		return semester;
	}

	private Semester save(Semester semester) {
		return semesterRepository.save(semester);
	}

	public Semester save(SemesterDto dto) {
		Semester semester = new Semester(dto);
		return save(semester);
	}

	public void delete(Long id) {
		Optional<Semester> semester = semesterRepository.findById(id);
		
		if (semester.isPresent()) {
			semesterRepository.delete(semester.get());
		}
	}

}
