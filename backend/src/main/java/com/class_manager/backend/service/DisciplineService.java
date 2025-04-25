package com.class_manager.backend.service;

import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.class_manager.backend.model.Discipline;
import com.class_manager.backend.model.Teacher;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.DisciplineRepository;
import com.class_manager.backend.repository.UserRepository;
import com.class_manager.backend.utils.Patcher;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class DisciplineService {

	private final DisciplineRepository disciplineRepository;
	private final UserRepository userRepository;

	public DisciplineService(DisciplineRepository disciplineRepository, UserRepository userRepository) {
		this.disciplineRepository = disciplineRepository;
		this.userRepository = userRepository;
	}

	public List<Discipline> findAll() {
		return disciplineRepository.findAll();
	}

	public Optional<Discipline> findById(Long id) {
		return disciplineRepository.findById(id);
	}

	public Discipline save(DisciplineDto dto) {
		Discipline newDiscipline = new Discipline(dto);
		Teacher teacher = (Teacher) userRepository.findById(dto.teacherId()).orElseThrow(() -> new EntityNotFoundException(
				"Teacher not found with id: " + dto.teacherId()));

		newDiscipline.setTeacher(teacher);

		return disciplineRepository.save(newDiscipline);
	}

	/**
	 * Partially updates a Discipline entity with the provided fields from the
	 * DisciplineDto.
	 * 
	 * If a teacherId is provided in the DTO, it verifies the existence of the user
	 * and ensures it is a Teacher.
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
		Discipline partialDiscipline = new Discipline(disciplineDto);
		UUID teacherId = disciplineDto.teacherId();

		if (teacherId != null) {
			User user = userRepository.findById(teacherId)
					.orElseThrow(() -> new EntityNotFoundException(
							"Teacher not found with id: " + teacherId));

			if (!(user instanceof Teacher)) {
				throw new IllegalArgumentException("User with id " + teacherId + " is not a Teacher");
			}

			partialDiscipline.setTeacher((Teacher) user);
		}

		Discipline existingDiscipline = disciplineRepository.findById(disciplineId)
				.orElseThrow(() -> new EntityNotFoundException("Discipline not found with id: " + disciplineId));

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
