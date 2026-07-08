package com.trafficguard.controller;

import com.trafficguard.entity.VehicleOwner;
import com.trafficguard.entity.Violation;
import com.trafficguard.repository.VehicleOwnerRepository;
import com.trafficguard.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin(origins = "*")
public class OwnerController {

    @Autowired
    private VehicleOwnerRepository vehicleOwnerRepository;

    @Autowired
    private ViolationRepository violationRepository;

    // GET /api/owners/{vehicleNumber}
    @GetMapping("/{vehicleNumber}")
    public ResponseEntity<?> getOwnerAndHistory(@PathVariable String vehicleNumber) {
        String queryNumber = vehicleNumber.toUpperCase();
        Optional<VehicleOwner> ownerOpt = vehicleOwnerRepository.findByVehicleNumberIgnoreCase(queryNumber);

        if (ownerOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Owner details not found for vehicle: " + queryNumber);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        VehicleOwner owner = ownerOpt.get();
        List<Violation> history = violationRepository.findByVehicleNumber(queryNumber);

        Map<String, Object> response = new HashMap<>();
        response.put("vehicleNumber", owner.getVehicleNumber());
        response.put("ownerName", owner.getOwnerName());
        response.put("phone", owner.getPhone());
        response.put("email", owner.getEmail());
        response.put("address", owner.getAddress());
        response.put("licenseNumber", owner.getLicenseNumber());
        response.put("vehicleModel", owner.getVehicleModel());
        response.put("previousViolations", owner.getPreviousViolations());
        response.put("createdAt", owner.getCreatedAt());
        response.put("violationsHistory", history);

        return ResponseEntity.ok(response);
    }
}
