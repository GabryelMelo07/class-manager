package com.class_manager.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.class_manager.backend.dto.model.discipline.DisciplineDto;
import com.class_manager.backend.model.Discipline;
import com.class_manager.backend.model.Teacher;
import com.class_manager.backend.model.User;
import com.class_manager.backend.repository.DisciplineRepository;
import com.class_manager.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class DisciplineServiceTest {

    @Mock
    private DisciplineRepository disciplineRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DisciplineService disciplineService;

    @Test
    void shouldPatchDisciplineWithValidTeacher() throws IllegalAccessException {
        UUID teacherId = UUID.randomUUID();
        Long disciplineId = 1L;

        DisciplineDto dto = new DisciplineDto("Math", "MTH", teacherId);

        Teacher teacher = new Teacher();
        teacher.setId(teacherId);
        teacher.setName("John");

        Discipline existing = new Discipline();
        existing.setId(disciplineId);
        existing.setName("Old");
        existing.setAbbreviation("OLD");

        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(disciplineRepository.findById(disciplineId)).thenReturn(Optional.of(existing));
        when(disciplineRepository.save(any(Discipline.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Discipline updated = disciplineService.patch(disciplineId, dto);

        assertEquals("Math", updated.getName());
        assertEquals("MTH", updated.getAbbreviation());
        assertEquals(teacher, updated.getTeacher());
    }

    @Test
    void shouldThrowIfTeacherNotFound() {
        UUID teacherId = UUID.randomUUID();
        Long disciplineId = 1L;
        DisciplineDto dto = new DisciplineDto("Math", "MTH", teacherId);

        when(userRepository.findById(teacherId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> disciplineService.patch(disciplineId, dto));
        assertTrue(ex.getMessage().contains("Teacher not found"));
    }

    @Test
    void shouldThrowIfUserIsNotTeacher() {
        UUID teacherId = UUID.randomUUID();
        Long disciplineId = 1L;
        User user = new User(); // Not a Teacher instance
        user.setId(teacherId);

        DisciplineDto dto = new DisciplineDto("Math", "MTH", teacherId);

        when(userRepository.findById(teacherId)).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> disciplineService.patch(disciplineId, dto));
        assertTrue(ex.getMessage().contains("is not a Teacher"));
    }

}
