package com.trafficguard.controller;

import com.trafficguard.entity.Violation;
import com.trafficguard.entity.VehicleOwner;
import com.trafficguard.repository.ViolationRepository;
import com.trafficguard.repository.VehicleOwnerRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/violations")
@CrossOrigin(origins = "*") // Allow frontend integration
public class ViolationController {

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    // GET /api/violations (Allows filtering for regular officers vs admins)
    @GetMapping
    public ResponseEntity<List<Violation>> getAllViolations(
            @RequestParam(required = false) String officerId,
            @RequestParam(required = false) String role) {
        
        List<Violation> violations;
        if ("officer".equalsIgnoreCase(role) && officerId != null && !officerId.isBlank()) {
            violations = violationRepository.findByOfficerId(officerId);
        } else {
            violations = violationRepository.findAll();
        }
        return ResponseEntity.ok(violations);
    }

    // GET /api/violations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Violation> getViolationById(@PathVariable String id) {
        Optional<Violation> violationOpt = violationRepository.findById(id);
        return violationOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // POST /api/violations
    @PostMapping
    public ResponseEntity<?> createViolation(@Valid @RequestBody Violation violationRequest) {
        // Find existing violations to set repeat offender flag
        long previousCount = violationRepository.countByVehicleNumber(violationRequest.getVehicleNumber());
        boolean isRepeatOffender = previousCount > 0;
        violationRequest.setRepeatOffender(isRepeatOffender);

        // Generate ID if not present
        if (violationRequest.getId() == null || violationRequest.getId().isBlank()) {
            violationRequest.setId("v_" + System.currentTimeMillis());
        }
        if (violationRequest.getDateTime() == null) {
            violationRequest.setDateTime(LocalDateTime.now());
        }

        // Fetch or create owner
        String vehicleNo = violationRequest.getVehicleNumber().toUpperCase();
        Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByVehicleNumberIgnoreCase(vehicleNo);
        
        if (ownerOpt.isPresent()) {
            VehicleOwner owner = ownerOpt.get();
            owner.setPreviousViolations((int) (previousCount + 1));
            if (violationRequest.getOwnerName() != null && !violationRequest.getOwnerName().isBlank()) {
                owner.setOwnerName(violationRequest.getOwnerName());
            }
            vehicleOwnerRepository.save(owner);
            violationRequest.setOwnerName(owner.getOwnerName());
        } else {
            // Register a dummy owner since vehicle is new to system
            VehicleOwner newOwner = new VehicleOwner(
                    vehicleNo,
                    violationRequest.getOwnerName() != null ? violationRequest.getOwnerName() : "Unknown Owner",
                    "+91 9000000000",
                    "owner." + vehicleNo.toLowerCase() + "@gmail.com",
                    "Andhra Pradesh Registered, " + violationRequest.getDistrict(),
                    "AP" + (long) (Math.random() * 10000000000L),
                    "Motor Vehicle",
                    1
            );
            vehicleOwnerRepository.save(newOwner);
            violationRequest.setOwnerName(newOwner.getOwnerName());
        }

        Violation savedViolation = violationRepository.save(violationRequest);
        return ResponseEntity.status(HttpStatus.CREATED).addHeader("Location", "/api/violations/" + savedViolation.getId()).body(savedViolation);
    }

    // PUT /api/violations/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Violation> updateViolation(@PathVariable String id, @RequestBody Violation updateDetails) {
        Optional<Violation> violationOpt = violationRepository.findById(id);
        if (violationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        Violation existing = violationOpt.get();
        if (updateDetails.getViolationType() != null) existing.setViolationType(updateDetails.getViolationType());
        if (updateDetails.getFineAmount() != null) existing.setFineAmount(updateDetails.getFineAmount());
        if (updateDetails.getLocation() != null) existing.setLocation(updateDetails.getLocation());
        if (updateDetails.getStatus() != null) existing.setStatus(updateDetails.getStatus());
        if (updateDetails.getDescription() != null) existing.setDescription(updateDetails.getDescription());
        if (updateDetails.getEvidenceImage() != null) existing.setEvidenceImage(updateDetails.getEvidenceImage());

        Violation updated = violationRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/violations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteViolation(@PathVariable String id) {
        if (!violationRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Violation record not found");
        }
        violationRepository.deleteById(id);
        return ResponseEntity.ok("Violation record deleted successfully");
    }
}
