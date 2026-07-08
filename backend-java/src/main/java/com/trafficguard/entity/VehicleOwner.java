package com.trafficguard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_owners")
public class VehicleOwner {

    @Id
    @Column(name = "vehicle_number", length = 20)
    private String vehicleNumber; // e.g. AP16BZ1234

    @NotBlank(message = "Owner Name is required")
    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @NotBlank(message = "Phone number is required")
    @Column(nullable = false)
    private String phone;

    private String email;

    @NotBlank(message = "Address is required")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String address;

    @NotBlank(message = "License Number is required")
    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @NotBlank(message = "Vehicle Model is required")
    @Column(name = "vehicle_model", nullable = false)
    private String vehicleModel;

    @Column(name = "previous_violations")
    private int previousViolations = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public VehicleOwner() {}

    public VehicleOwner(String vehicleNumber, String ownerName, String phone, String email, String address, String licenseNumber, String vehicleModel, int previousViolations) {
        this.vehicleNumber = vehicleNumber;
        this.ownerName = ownerName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.licenseNumber = licenseNumber;
        this.vehicleModel = vehicleModel;
        this.previousViolations = previousViolations;
    }

    // Getters and Setters
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public int getPreviousViolations() { return previousViolations; }
    public void setPreviousViolations(int previousViolations) { this.previousViolations = previousViolations; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
