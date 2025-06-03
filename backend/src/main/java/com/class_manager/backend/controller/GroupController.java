package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.group.GroupDto;
import com.class_manager.backend.model.Group;
import com.class_manager.backend.service.GroupService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;
	
    @GetMapping("/course/{courseId}")
    public ResponseEntity<Page<Group>> findAllByCourse(@PathVariable Long courseId, Pageable pageable) {
        return ResponseEntity.ok(groupService.findAllByCourse(courseId, pageable));
    }

	// TODO: POSSÍVELMENTE NÃO SERÁ USADO, ANALISAR E REMOVER
    @GetMapping("/{id}")
    public ResponseEntity<Group> findById(@PathVariable Long id) {
        return groupService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

	@GetMapping("/semesters-of-course/{courseId}")
	public ResponseEntity<List<Integer>> findAllSemestersOfCourse(@PathVariable Long courseId) {
		return ResponseEntity.ok(groupService.findAllSemestersOfCourse(courseId));
	}

    @PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
    public ResponseEntity<Group> save(@RequestBody GroupDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.save(dto));
    }

	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
	public ResponseEntity<Group> patch(@PathVariable Long id, @RequestBody GroupDto groupDto) {
		return ResponseEntity.ok(groupService.patch(id, groupDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_COORDINATOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        groupService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
