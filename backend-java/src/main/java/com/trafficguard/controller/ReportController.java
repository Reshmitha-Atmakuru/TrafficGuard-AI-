package com.trafficguard.controller;

import com.trafficguard.entity.Violation;
import com.trafficguard.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ViolationRepository violationRepository;

    // GET /api/reports/weekly
    @GetMapping("/weekly")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyReport() {
        List<Violation> violations = violationRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        String[] weekdays = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

        // Calculate statistics for last 7 calendar days
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            String dateStr = date.toString();
            String dayName = weekdays[date.getDayOfWeek().getValue() % 7];

            long count = violations.stream()
                    .filter(v -> v.getDateTime().toLocalDate().equals(date))
                    .count();

            double fines = violations.stream()
                    .filter(v -> v.getDateTime().toLocalDate().equals(date))
                    .mapToDouble(Violation::getFineAmount)
                    .sum();

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", dayName);
            dayMap.put("date", dateStr);
            dayMap.put("violations", count);
            dayMap.put("fineCollected", fines);
            result.add(dayMap);
        }

        return ResponseEntity.ok(result);
    }

    // GET /api/reports/monthly
    @GetMapping("/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyReport() {
        List<Violation> violations = violationRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();

        for (int i = 1; i <= currentMonth; i++) {
            final int monthIdx = i;
            long count = violations.stream()
                    .filter(v -> v.getDateTime().getYear() == currentYear && v.getDateTime().getMonthValue() == monthIdx)
                    .count();

            double fines = violations.stream()
                    .filter(v -> v.getDateTime().getYear() == currentYear && v.getDateTime().getMonthValue() == monthIdx)
                    .mapToDouble(Violation::getFineAmount)
                    .sum();

            Map<String, Object> monthMap = new HashMap<>();
            monthMap.put("month", months[i - 1]);
            monthMap.put("violations", count);
            monthMap.put("fineCollected", fines);
            result.add(monthMap);
        }

        return ResponseEntity.ok(result);
    }
}
