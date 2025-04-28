package com.class_manager.backend.controller;

import com.class_manager.backend.dto.model.class_room.ClassRoomDto;
import com.class_manager.backend.model.ClassRoom;
import com.class_manager.backend.service.ClassRoomService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/class-rooms")
public class ClassRoomController {

    private final ClassRoomService classRoomService;

    public ClassRoomController(ClassRoomService classRoomService) {
        this.classRoomService = classRoomService;
    }

    @GetMapping
    public ResponseEntity<List<ClassRoom>> findAll() {
        return ResponseEntity.ok().body(classRoomService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassRoom> findById(@PathVariable Long id) {
        return classRoomService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ClassRoom> save(@RequestBody ClassRoomDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classRoomService.save(dto));
    }

	@PatchMapping("/{id}")
	public ResponseEntity<ClassRoom> patch(@PathVariable Long id, @RequestBody ClassRoomDto classRoomDto) {
		return ResponseEntity.ok(classRoomService.patch(id, classRoomDto));
	}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classRoomService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
