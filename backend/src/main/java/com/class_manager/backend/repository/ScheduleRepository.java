package com.class_manager.backend.repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.class_manager.backend.dto.model.class_room.ClassRoomOccupationReport;
import com.class_manager.backend.dto.model.course.CourseDisciplineWorkloadReport;
import com.class_manager.backend.dto.model.teacher.TeacherWorkloadReport;
import com.class_manager.backend.model.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
	@Query("""
				SELECT s FROM Schedule s
					WHERE s.semester.id = :semesterId
					AND s.group.discipline.course.id = :courseId
			""")
	List<Schedule> findSchedulesBySemesterAndCourse(@Param("semesterId") Long semesterId,
			@Param("courseId") Long courseId);

	@Query("""
				SELECT s FROM Schedule s
					WHERE s.semester.id = :semesterId
			""")
	List<Schedule> findSchedulesBySemester(@Param("semesterId") Long semesterId);

	@Query("""
				SELECT s FROM Schedule s
					WHERE s.semester.id = :semesterId
					AND s.group.discipline.teacher.id = :teacherId
			""")
	List<Schedule> findSchedulesBySemesterAndTeacher(@Param("semesterId") Long semesterId,
			@Param("teacherId") UUID teacherId);

	@Query("""
			     SELECT COUNT(s) > 0
			     FROM Schedule s
			     WHERE
			s.semester.id = :semesterId
			         AND s.group.discipline.teacher.id = :teacherId
			         AND s.dayOfWeek = :dayOfWeek
			         AND (
			             (s.startTime < :endTime AND s.endTime > :startTime)
			         )
			         AND (:excludeId IS NULL OR s.id <> :excludeId)
			 """)
	boolean existsByTeacherAndTime(
			@Param("teacherId") UUID teacherId,
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") DayOfWeek dayOfWeek,
			@Param("startTime") LocalTime startTime,
			@Param("endTime") LocalTime endTime,
			@Param("excludeId") Long excludeId);

	@Query("""
			     SELECT COUNT(s) > 0
			     FROM Schedule s
			     WHERE
			s.semester.id = :semesterId
			         AND s.group.classRoom.id = :classRoomId
			         AND s.dayOfWeek = :dayOfWeek
			         AND (
			             (s.startTime < :endTime AND s.endTime > :startTime)
			         )
			         AND (:excludeId IS NULL OR s.id <> :excludeId)
			 """)
	boolean existsByClassRoomAndTime(
			@Param("classRoomId") Long classRoomId,
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") DayOfWeek dayOfWeek,
			@Param("startTime") LocalTime startTime,
			@Param("endTime") LocalTime endTime,
			@Param("excludeId") Long excludeId);

	@Query("""
				SELECT COUNT(s) > 0
				FROM Schedule s
				WHERE
					s.semester.id = :semesterId
					AND s.group.id = :groupId
					AND s.dayOfWeek = :dayOfWeek
					AND s.startTime = :startTime
					AND s.endTime = :endTime
					AND (:excludeId IS NULL OR s.id <> :excludeId)
			""")
	boolean existsByGroupAndTime(
			@Param("groupId") Long groupId,
			@Param("semesterId") Long semesterId,
			@Param("dayOfWeek") DayOfWeek dayOfWeek,
			@Param("startTime") LocalTime startTime,
			@Param("endTime") LocalTime endTime,
			@Param("excludeId") Long excludeId);

	List<Schedule> findByGroupId(Long groupId);

	@Query("""
			    SELECT NEW com.class_manager.backend.dto.model.teacher.TeacherWorkloadReport(
			        CONCAT(u.name, ' ', u.surname),
			        SUM(FUNCTION('TIMESTAMPDIFF', MINUTE, s.startTime, s.endTime)) / 60.0
			    )
			    FROM Schedule s
			    JOIN s.group g
			    JOIN g.discipline d
			    JOIN d.teacher u
			    WHERE s.semester.id = :semesterId
			    GROUP BY u.id
			""")
	List<TeacherWorkloadReport> findTeacherWorkloadBySemester(@Param("semesterId") Long semesterId);

	@Query("""
			    SELECT NEW com.class_manager.backend.dto.model.course.CourseDisciplineWorkloadReport(
			        c.name,
			        d.name,
			        SUM(FUNCTION('TIMESTAMPDIFF', MINUTE, s.startTime, s.endTime)) / 60.0
			    )
			    FROM Schedule s
			    JOIN s.group g
			    JOIN g.discipline d
			    JOIN d.course c
			    WHERE s.semester.id = :semesterId
			    GROUP BY c.id, d.id
			""")
	List<CourseDisciplineWorkloadReport> findCourseDisciplineWorkloadBySemester(@Param("semesterId") Long semesterId);

	@Query("""
			    SELECT NEW com.class_manager.backend.dto.model.class_room.ClassRoomOccupationReport(
			        cr.name,
			        s.dayOfWeek,
			        s.startTime,
			        s.endTime,
			        g.name,
			        d.name
			    )
			    FROM Schedule s
			    JOIN s.group g
			    JOIN g.classRoom cr
			    JOIN g.discipline d
			    WHERE s.semester.id = :semesterId
			    ORDER BY cr.name, s.dayOfWeek, s.startTime
			""")
	List<ClassRoomOccupationReport> findClassRoomOccupationBySemester(@Param("semesterId") Long semesterId);
}
