package com.trafficguard.repository;

import com.trafficguard.entity.Hotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, String> {
    List<Hotspot> findByDistrictIgnoreCase(String district);
}
