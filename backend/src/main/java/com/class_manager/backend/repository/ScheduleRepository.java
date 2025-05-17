package com.class_manager.backend.repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.model.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
	@Query("""
				SELECT s FROM Schedule s
					WHERE s.semester.id = :semesterId
			""")
	List<Schedule> findSchedulesBySemester(@Param("semesterId") Long semesterId);

	@Query("""
        SELECT COUNT(s) > 0 
        FROM Schedule s
        WHERE 
            s.group.discipline.teacher.id = :teacherId
            AND s.dayOfWeek = :dayOfWeek
            AND (
                (s.startTime < :endTime AND s.endTime > :startTime)
            )
            AND (:excludeId IS NULL OR s.id <> :excludeId)
    """)
    boolean existsByTeacherAndTime(
        @Param("teacherId") UUID teacherId,
        @Param("dayOfWeek") DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") Long excludeId
    );

    @Query("""
        SELECT COUNT(s) > 0 
        FROM Schedule s
        WHERE 
            s.group.classRoom.id = :classRoomId
            AND s.dayOfWeek = :dayOfWeek
            AND (
                (s.startTime < :endTime AND s.endTime > :startTime)
            )
            AND (:excludeId IS NULL OR s.id <> :excludeId)
    """)
    boolean existsByClassRoomAndTime(
        @Param("classRoomId") Long classRoomId,
        @Param("dayOfWeek") DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") Long excludeId
    );

	@Query("""
		SELECT COUNT(s) > 0 
		FROM Schedule s
		WHERE 
			s.group.id = :groupId
			AND s.dayOfWeek = :dayOfWeek
			AND s.startTime = :startTime
			AND s.endTime = :endTime
			AND (:excludeId IS NULL OR s.id <> :excludeId)
	""")
	boolean existsByGroupAndTime(
		@Param("groupId") Long groupId,
		@Param("dayOfWeek") DayOfWeek dayOfWeek,
		@Param("startTime") LocalTime startTime,
		@Param("endTime") LocalTime endTime,
		@Param("excludeId") Long excludeId
	);
}
