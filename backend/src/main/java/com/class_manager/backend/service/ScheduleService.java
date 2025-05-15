package com.class_manager.backend.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.class_manager.backend.dto.model.schedule.ScheduleDto;
import com.class_manager.backend.model.Group;
import com.class_manager.backend.model.Schedule;
import com.class_manager.backend.repository.GroupRepository;
import com.class_manager.backend.repository.ScheduleRepository;
import com.class_manager.backend.utils.Patcher;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ScheduleService {

	private final ScheduleRepository scheduleRepository;
	private final GroupRepository groupRepository;
	private final SemesterService semesterService;

	public ScheduleService(ScheduleRepository scheduleRepository, GroupRepository groupRepository, SemesterService semesterService) {
		this.scheduleRepository = scheduleRepository;
		this.groupRepository = groupRepository;
		this.semesterService = semesterService;
	}

	public Page<Schedule> findAll(Pageable pageable) {
		return scheduleRepository.findAll(pageable);
	}

	public Optional<Schedule> findById(Long id) {
		return scheduleRepository.findById(id);
	}

	public Schedule save(ScheduleDto dto) {
		Group group = groupRepository.findById(dto.groupId())
				.orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + dto.groupId()));
		
		Schedule newSchedule = new Schedule(dto);

		newSchedule.setGroup(group);
		newSchedule.setSemester(semesterService.getCurrentSemester());

		return scheduleRepository.save(newSchedule);
	}

	public Schedule patch(Long scheduleId, ScheduleDto scheduleDto) {
		Schedule partialSchedule = new Schedule(scheduleDto);

		Schedule existingSchedule = scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + scheduleId));
		
		if (scheduleDto.groupId() != null) {
			Group group = groupRepository.findById(scheduleDto.groupId())
					.orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + scheduleDto.groupId()));

			partialSchedule.setGroup(group);
		}

		try {
			Patcher.patch(partialSchedule, existingSchedule);
			return scheduleRepository.save(existingSchedule);
		} catch (Exception e) {
			log.error("Error when trying to patch (Partial Update) the Schedule entity with id: {}", scheduleId, e);
			throw new RuntimeException("Failed to patch Schedule", e);
		}
	}

	public void deleteById(Long id) {
		scheduleRepository.deleteById(id);
	}

}
