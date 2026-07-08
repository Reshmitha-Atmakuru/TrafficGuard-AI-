package com.trafficguard.controller;

import com.trafficguard.entity.User;
import com.trafficguard.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // POST /api/login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username and password are required");
        }

        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        User user = userOpt.get();
        // Return details without password
        User responseUser = new User();
        responseUser.setId(user.getId());
        responseUser.setUsername(user.getUsername());
        responseUser.setName(user.getName());
        responseUser.setBadgeNumber(user.getBadgeNumber());
        responseUser.setRole(user.getRole());
        responseUser.setDistrict(user.getDistrict());
        responseUser.setCreatedAt(user.getCreatedAt());

        return ResponseEntity.ok(responseUser);
    }

    // POST /api/signup (Create new traffic officer / admin)
    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(@Valid @RequestBody User newUser) {
        if (userRepository.existsByUsername(newUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken");
        }

        if (newUser.getId() == null || newUser.getId().isBlank()) {
            newUser.setId("u_" + System.currentTimeMillis());
        }

        User savedUser = userRepository.save(newUser);
        
        // Return details without password
        User responseUser = new User();
        responseUser.setId(savedUser.getId());
        responseUser.setUsername(savedUser.getUsername());
        responseUser.setName(savedUser.getName());
        responseUser.setBadgeNumber(savedUser.getBadgeNumber());
        responseUser.setRole(savedUser.getRole());
        responseUser.setDistrict(savedUser.getDistrict());
        responseUser.setCreatedAt(savedUser.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(responseUser);
    }
}
