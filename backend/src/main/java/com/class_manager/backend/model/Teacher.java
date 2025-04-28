package com.class_manager.backend.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
public class Teacher extends User {

	@OneToMany(mappedBy = "teacher")
	private List<Discipline> disciplines;

	public Teacher(String email, String password, String name, String surname, Role role) {
        super(email, password, name, surname, role);
    }
	
}
