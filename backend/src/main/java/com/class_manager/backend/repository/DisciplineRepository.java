package com.class_manager.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.model.Discipline;

@Repository
public interface DisciplineRepository extends JpaRepository<Discipline, Long> {
	Page<Discipline> findByCourseIdAndActiveTrue(Long courseId, Pageable pageable);
	Page<Discipline> findByActiveTrue(Pageable pageable);
	Optional<Discipline> findByName(String name);
}
