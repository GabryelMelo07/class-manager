package com.class_manager.backend.service;

import com.class_manager.backend.dto.model.group.GroupDto;
import com.class_manager.backend.model.ClassRoom;
import com.class_manager.backend.model.Discipline;
import com.class_manager.backend.model.Group;
import com.class_manager.backend.repository.ClassRoomRepository;
import com.class_manager.backend.repository.DisciplineRepository;
import com.class_manager.backend.repository.GroupRepository;
import com.class_manager.backend.utils.Patcher;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class GroupService {

	private final GroupRepository groupRepository;
	private final ClassRoomRepository classRoomRepository;
	private final DisciplineRepository disciplineRepository;
	private final SemesterService semesterService;

	public GroupService(GroupRepository groupRepository, ClassRoomRepository classRoomRepository,
			DisciplineRepository disciplineRepository, SemesterService semesterService) {
		this.groupRepository = groupRepository;
		this.classRoomRepository = classRoomRepository;
		this.disciplineRepository = disciplineRepository;
		this.semesterService = semesterService;
	}

	public Page<Group> findAll(Pageable pageable) {
		return groupRepository.findAll(pageable);
	}

	public Optional<Group> findById(Long id) {
		return groupRepository.findById(id);
	}

	public Group save(GroupDto dto) {
		Discipline discipline = disciplineRepository.findById(dto.disciplineId())
				.orElseThrow(() -> new EntityNotFoundException(
						"Discipline not found with id: " + dto.disciplineId()));

		ClassRoom classRoom = classRoomRepository.findById(dto.classRoomId())
				.orElseThrow(() -> new EntityNotFoundException(
						"ClassRoom not found with id: " + dto.classRoomId()));

		Group newGroup = new Group(dto);

		newGroup.setDiscipline(discipline);
		newGroup.setClassRoom(classRoom);
		newGroup.setSemester(semesterService.getCurrentSemester());

		return groupRepository.save(newGroup);
	}

	public Group patch(Long groupId, GroupDto groupDto) {
		Group partialGroup = new Group(groupDto);

		Group existingGroup = groupRepository.findById(groupId)
				.orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

		if (groupDto.disciplineId() != null) {
			Discipline discipline = disciplineRepository.findById(groupDto.disciplineId())
					.orElseThrow(() -> new EntityNotFoundException(
							"Discipline not found with id: " + groupDto.disciplineId()));

			partialGroup.setDiscipline(discipline);
		}

		if (groupDto.classRoomId() != null) {
			ClassRoom classRoom = classRoomRepository.findById(groupDto.classRoomId())
					.orElseThrow(() -> new EntityNotFoundException(
							"ClassRoom not found with id: " + groupDto.classRoomId()));

			partialGroup.setClassRoom(classRoom);
		}

		try {
			Patcher.patch(existingGroup, partialGroup);
			return groupRepository.save(existingGroup);
		} catch (IllegalAccessException e) {
			throw new RuntimeException("Failed to patch Group", e);
		}
	}

	public void deleteById(Long id) {
		groupRepository.deleteById(id);
	}

}
