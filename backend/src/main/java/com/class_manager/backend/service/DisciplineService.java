package com.class_manager.backend.service;

import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.class_manager.backend.model.Course;
import com.class_manager.backend.model.Discipline;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.CourseRepository;
import com.class_manager.backend.repository.DisciplineRepository;
import com.class_manager.backend.repository.UserRepository;
import com.class_manager.backend.utils.Patcher;

import static com.class_manager.backend.utils.UserScopeUtils.isTeacher;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class DisciplineService {

	private final DisciplineRepository disciplineRepository;
	private final CourseRepository courseRepository;
	private final UserRepository userRepository;

	public DisciplineService(DisciplineRepository disciplineRepository, CourseRepository courseRepository, UserRepository userRepository) {
		this.disciplineRepository = disciplineRepository;
		this.courseRepository = courseRepository;
		this.userRepository = userRepository;
	}

	public Page<Discipline> findAll(Pageable pageable) {
		return disciplineRepository.findAll(pageable);
	}

	public Optional<Discipline> findById(Long id) {
		return disciplineRepository.findById(id);
	}

	public Discipline save(DisciplineDto dto) {
		Course course = courseRepository.findById(dto.courseId())
				.orElseThrow(() -> new EntityNotFoundException(
						"Course not found with id: " + dto.courseId()));
		
		User teacher = userRepository.findById(dto.teacherId())
				.orElseThrow(() -> new EntityNotFoundException(
						"Teacher not found with id: " + dto.teacherId()));

		if (!isTeacher(teacher)) {
			throw new IllegalArgumentException("User with id: " + dto.teacherId() + " is not a Teacher");
		}

		Discipline newDiscipline = new Discipline(dto);
		newDiscipline.setCourse(course);
		newDiscipline.setTeacher(teacher);

		return disciplineRepository.save(newDiscipline);
	}

	/**
	 * Partially updates a Discipline entity with the provided fields from the
	 * DisciplineDto.
	 * 
	 * If a teacherId is provided in the DTO, it verifies the existence of the user
	 * and ensures it is a User with the Role Teacher.
	 * Only non-null fields from the DTO are applied to the existing entity.
	 *
	 * @param disciplineId  the ID of the Discipline to update
	 * @param disciplineDto the data transfer object containing fields to update
	 * @return the updated Discipline entity
	 * @throws EntityNotFoundException  if the Discipline or the specified Teacher
	 *                                  is not found
	 * @throws IllegalArgumentException if the user with the given teacherId is not
	 *                                  a Teacher
	 * @throws RuntimeException         if an error occurs during the patching
	 *                                  process
	 */

	public Discipline patch(Long disciplineId, DisciplineDto disciplineDto) {
		Discipline existingDiscipline = disciplineRepository.findById(disciplineId)
				.orElseThrow(() -> new EntityNotFoundException("Discipline not found with id: " + disciplineId));
		
		Discipline partialDiscipline = new Discipline(disciplineDto);
		UUID teacherId = disciplineDto.teacherId();
		Long courseId = disciplineDto.courseId();

		if (teacherId != null) {
			User user = userRepository.findById(teacherId)
					.orElseThrow(() -> new EntityNotFoundException(
							"Teacher not found with id: " + teacherId));

			if (!isTeacher(user)) {
				throw new IllegalArgumentException("User with id " + teacherId + " is not a Teacher");
			}

			partialDiscipline.setTeacher(user);
		}

		if (courseId != null) {
			Course course = courseRepository.findById(courseId)
					.orElseThrow(() -> new EntityNotFoundException(
							"Course not found with id: " + courseId));

			partialDiscipline.setCourse(course);
		}

		try {
			Patcher.patch(existingDiscipline, partialDiscipline);
			return disciplineRepository.save(existingDiscipline);
		} catch (IllegalAccessException e) {
			log.error("Error when trying to patch (Partial Update) the Discipline entity with id: {}", disciplineId, e);
			throw new RuntimeException("Failed to patch Discipline", e);
		}
	}

	public void deleteById(Long id) {
		disciplineRepository.deleteById(id);
	}

}
