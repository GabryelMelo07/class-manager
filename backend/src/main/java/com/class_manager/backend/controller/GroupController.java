package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.group.GroupDto;
import com.class_manager.backend.model.Group;
import com.class_manager.backend.service.GroupService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public ResponseEntity<List<Group>> findAll() {
        return ResponseEntity.ok(groupService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> findById(@PathVariable Long id) {
        return groupService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Group> save(@RequestBody GroupDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.save(dto));
    }

	@PatchMapping("/{id}")
	public ResponseEntity<Group> patch(@PathVariable Long id, @RequestBody GroupDto groupDto) {
		return ResponseEntity.ok(groupService.patch(id, groupDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        groupService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
