package com.trafficguard.repository;

import com.trafficguard.entity.VehicleOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VehicleOwnerRepository extends JpaRepository<VehicleOwner, String> {
    Optional<VehicleOwner> findByVehicleNumberIgnoreCase(String vehicleNumber);
}
