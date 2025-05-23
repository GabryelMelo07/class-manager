package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.class_room.ClassRoomDto;
import com.class_manager.backend.model.ClassRoom;
import com.class_manager.backend.service.ClassRoomService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/class-rooms")
public class ClassRoomController {

    private final ClassRoomService classRoomService;

    @GetMapping
    public ResponseEntity<Page<ClassRoom>> findAll(Pageable pageable) {
        return ResponseEntity.ok().body(classRoomService.findAll(pageable));
    }

	// TODO: POSSÍVELMENTE NÃO SERÁ USADO, ANALISAR E REMOVER
    @GetMapping("/{id}")
    public ResponseEntity<ClassRoom> findById(@PathVariable Long id) {
        return classRoomService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<ClassRoom> save(@RequestBody ClassRoomDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classRoomService.save(dto));
    }

	@PatchMapping("/{id}")
	@PreAuthorize("hasAuthority('SCOPE_ADMIN')")
	public ResponseEntity<ClassRoom> patch(@PathVariable Long id, @RequestBody ClassRoomDto classRoomDto) {
		return ResponseEntity.ok(classRoomService.patch(id, classRoomDto));
	}

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classRoomService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
