package com.trafficguard.controller;

import com.trafficguard.entity.Hotspot;
import com.trafficguard.repository.HotspotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotspots")
@CrossOrigin(origins = "*")
public class HotspotController {

    @Autowired
    private HotspotRepository hotspotRepository;

    // GET /api/hotspots
    @GetMapping
    public ResponseEntity<List<Hotspot>> getAllHotspots() {
        return ResponseEntity.ok(hotspotRepository.findAll());
    }
}
