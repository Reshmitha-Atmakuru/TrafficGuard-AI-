package com.trafficguard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @NotBlank(message = "Username cannot be blank")
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Full Name cannot be blank")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Badge Number cannot be blank")
    @Column(name = "badge_number", unique = true, nullable = false)
    private String badgeNumber;

    @NotBlank(message = "Role is required")
    @Column(nullable = false)
    private String role; // 'admin' or 'officer'

    @NotBlank(message = "District is required")
    @Column(nullable = false)
    private String district;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public User() {}

    public User(String id, String username, String password, String name, String badgeNumber, String role, String district) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.badgeNumber = badgeNumber;
        this.role = role;
        this.district = district;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBadgeNumber() { return badgeNumber; }
    public void setBadgeNumber(String badgeNumber) { this.badgeNumber = badgeNumber; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
