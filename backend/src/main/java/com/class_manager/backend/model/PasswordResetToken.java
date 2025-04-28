package com.class_manager.backend.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "password_reset_token")
@Data
public class PasswordResetToken {

	@Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

	@Column(nullable = false, unique = true)
    private String token;

	@Column(nullable = false)
    private Instant expirationDate;

    @OneToOne
    private User user;

}
