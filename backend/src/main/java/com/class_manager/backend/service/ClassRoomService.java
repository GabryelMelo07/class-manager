package com.class_manager.backend.service;

import com.class_manager.backend.dto.model.class_room.ClassRoomDto;
import com.class_manager.backend.model.ClassRoom;
import com.class_manager.backend.repository.ClassRoomRepository;
import com.class_manager.backend.utils.Patcher;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassRoomService {

	private final ClassRoomRepository classRoomRepository;

	public Page<ClassRoom> findAll(Pageable pageable) {
		return classRoomRepository.findByActiveTrue(pageable);
	}

	public Optional<ClassRoom> findById(Long id) {
		return classRoomRepository.findById(id);
	}

	public Optional<Long> findByName(String name) {
		return classRoomRepository.findByName(name)
				.map(ClassRoom::getId);
	}

	public ClassRoom save(ClassRoomDto dto) {
		ClassRoom newClassRoom = new ClassRoom(dto);
		return classRoomRepository.save(newClassRoom);
	}

	public ClassRoom patch(Long classRoomId, ClassRoomDto classRoomDto) {
		ClassRoom existingClassRoom = classRoomRepository.findById(classRoomId)
				.orElseThrow(() -> new EntityNotFoundException("ClassRoom not found whit id: " + classRoomId));

		if (existingClassRoom.getActive() == false) {
			throw new RuntimeException("Failed to patch ClassRoom");
		}

		ClassRoom partialClassRoom = new ClassRoom(classRoomDto);

		try {
			Patcher.patch(existingClassRoom, partialClassRoom);
			return classRoomRepository.save(existingClassRoom);
		} catch (IllegalAccessException e) {
			log.error("Error when trying to patch (Partial Update) the ClassRoom entity with id: {}", classRoomId, e);
			throw new RuntimeException("Failed to patch ClassRoom", e);
		}
	}

	public void deleteSoft(Long id) {
		ClassRoom classRoom = classRoomRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Class Room not found."));

		classRoom.setActive(false);
		classRoomRepository.save(classRoom);
	}

}
