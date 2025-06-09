package com.class_manager.backend.model;

import com.class_manager.backend.dto.model.class_room.ClassRoomDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "class_room")
@Data
@NoArgsConstructor
public class ClassRoom {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

	@Column(nullable = false, length = 50)
	private String name;
	
	@Column(nullable = false, length = 10)
	private String abbreviation;

	@Column(nullable = false, length = 50)
	private String location;

	@Column(columnDefinition = "boolean default true")
	private Boolean active;
	
	public ClassRoom(ClassRoomDto createClassRoomDto) {
		this.name = createClassRoomDto.name();
		this.abbreviation = createClassRoomDto.abbreviation();
		this.location = createClassRoomDto.location();
	}
	
}
