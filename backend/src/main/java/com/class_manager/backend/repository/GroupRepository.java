package com.class_manager.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.model.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

	@Query("""
				SELECT g FROM Group g
					WHERE g.discipline.course.id = :courseId
			""")
	Page<Group> findAllByCourse(@Param("courseId") Long courseId, Pageable pageable);

}
