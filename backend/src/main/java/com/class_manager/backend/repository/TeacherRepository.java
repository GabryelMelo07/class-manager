package com.class_manager.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.model.Teacher;

@Repository
public interface TeacherRepository extends UserRepository {

	@Query("SELECT u FROM User u WHERE TYPE(u) = Teacher")
	List<Teacher> findAllTeachers();

}
