package com.trafficguard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotspots")
public class Hotspot {

    @Id
    private String id;

    @NotBlank(message = "Location Name is required")
    @Column(name = "location_name", nullable = false)
    private String locationName;

    @NotBlank(message = "District is required")
    @Column(nullable = false)
    private String district;

    @NotBlank(message = "Risk level is required")
    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // 'High Risk', 'Medium Risk', 'Low Risk'

    @Column(name = "accident_count")
    private int accidentCount = 0;

    @Column(name = "violation_count")
    private int violationCount = 0;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double latitude;
    private Double longitude;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Hotspot() {}

    public Hotspot(String id, String locationName, String district, String riskLevel, int accidentCount, int violationCount, String description, Double latitude, Double longitude) {
        this.id = id;
        this.locationName = locationName;
        this.district = district;
        this.riskLevel = riskLevel;
        this.accidentCount = accidentCount;
        this.violationCount = violationCount;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public int getAccidentCount() { return accidentCount; }
    public void setAccidentCount(int accidentCount) { this.accidentCount = accidentCount; }

    public int getViolationCount() { return violationCount; }
    public void setViolationCount(int violationCount) { this.violationCount = violationCount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
