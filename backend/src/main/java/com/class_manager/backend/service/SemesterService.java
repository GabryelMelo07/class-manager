package com.class_manager.backend.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.class_manager.backend.enums.SemesterStatus;
import com.class_manager.backend.model.Semester;
import com.class_manager.backend.repository.SemesterRepository;
import com.class_manager.backend.utils.SemesterUtils;

import static com.class_manager.backend.model.Semester.createCurrentSemester;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SemesterService {

	private final SemesterRepository semesterRepository;

	public SemesterService(SemesterRepository semesterRepository) {
		this.semesterRepository = semesterRepository;
	}

	private Optional<Semester> findCurrentSemester() {
		int year = SemesterUtils.getCurrentYear();
		int semesterNumber = SemesterUtils.getCurrentSemesterNumber();
		return semesterRepository.findCurrentSemester(year, semesterNumber);
	}

	private void finalizeSemester() {
		Optional<Semester> optionalSemester = semesterRepository.findActiveSemester();

		if (optionalSemester.isPresent()) {
			Semester semester = optionalSemester.get();
			semester.setStatus(SemesterStatus.FINALIZED);
			semesterRepository.save(semester);
		}
	}

	public Semester getCurrentSemester() {
		Optional<Semester> currentSemester = findCurrentSemester();

		if (currentSemester.isPresent()) {
			log.info("Current semester already exists: {}", currentSemester.get());
			return currentSemester.get();
		}

		log.info("Finalizing previous semester if exists");
		finalizeSemester();
		
		log.info("Actual semester did not exist yet, creating new current semester");
		Semester semester = createCurrentSemester();
		return semesterRepository.save(semester);
	}

	public Page<Semester> findAll(Pageable pageable) {
		return semesterRepository.findAll(pageable);
	}

}
