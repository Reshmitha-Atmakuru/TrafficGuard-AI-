package com.trafficguard.repository;

import com.trafficguard.entity.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, String> {
    List<Violation> findByOfficerId(String officerId);
    List<Violation> findByVehicleNumber(String vehicleNumber);
    long countByVehicleNumber(String vehicleNumber);
}
