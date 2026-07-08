package com.trafficguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TrafficGuardApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrafficGuardApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" TrafficGuard AI - Java Spring Boot Backend Live");
        System.out.println(" Running REST APIs on: http://localhost:8080");
        System.out.println("=================================================");
    }
}
