package com.class_manager.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.model.Discipline;

@Repository
public interface DisciplineRepository extends JpaRepository<Discipline, Long> {
	Page<Discipline> findByCourseId(Long courseId, Pageable pageable);
}
