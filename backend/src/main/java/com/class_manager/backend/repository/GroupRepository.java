package com.class_manager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.model.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
}
