package com.trafficguard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
public class Violation {

    @Id
    private String id;

    @NotBlank(message = "Vehicle Number is required")
    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @NotBlank(message = "Owner Name is required")
    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @NotBlank(message = "Violation Type is required")
    @Column(name = "violation_type", nullable = false)
    private String violationType;

    @NotNull(message = "Fine Amount is required")
    @Column(name = "fine_amount", nullable = false)
    private Double fineAmount;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    @NotBlank(message = "District is required")
    @Column(nullable = false)
    private String district;

    @NotNull(message = "Violation Date and Time are required")
    @Column(name = "date_time", nullable = false)
    private LocalDateTime dateTime;

    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status = "Pending"; // 'Pending' or 'Paid'

    @Lob
    @Column(name = "evidence_image", columnDefinition = "LONGTEXT")
    private String evidenceImage;

    @Column(name = "officer_id")
    private String officerId;

    @NotBlank(message = "Officer Name is required")
    @Column(name = "officer_name", nullable = false)
    private String officerName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "repeat_offender")
    private boolean repeatOffender = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Violation() {}

    public Violation(String id, String vehicleNumber, String ownerName, String violationType, Double fineAmount, String location, String district, LocalDateTime dateTime, String status, String evidenceImage, String officerId, String officerName, String description, boolean repeatOffender) {
        this.id = id;
        this.vehicleNumber = vehicleNumber;
        this.ownerName = ownerName;
        this.violationType = violationType;
        this.fineAmount = fineAmount;
        this.location = location;
        this.district = district;
        this.dateTime = dateTime;
        this.status = status;
        this.evidenceImage = evidenceImage;
        this.officerId = officerId;
        this.officerName = officerName;
        this.description = description;
        this.repeatOffender = repeatOffender;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }

    public Double getFineAmount() { return fineAmount; }
    public void setFineAmount(Double fineAmount) { this.fineAmount = fineAmount; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEvidenceImage() { return evidenceImage; }
    public void setEvidenceImage(String evidenceImage) { this.evidenceImage = evidenceImage; }

    public String getOfficerId() { return officerId; }
    public void setOfficerId(String officerId) { this.officerId = officerId; }

    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isRepeatOffender() { return repeatOffender; }
    public void setRepeatOffender(boolean repeatOffender) { this.repeatOffender = repeatOffender; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
