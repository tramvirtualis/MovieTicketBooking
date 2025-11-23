package com.example.backend.controllers;

import com.example.backend.services.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
             allowedHeaders = "*",
             allowCredentials = "true")
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * Lấy tất cả các thống kê cho admin dashboard
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllStatistics() {
        try {
            StatisticsService.StatisticsDTO statistics = statisticsService.getAllStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê thành công");
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Lấy doanh thu và tổng vé bán ra theo tất cả các rạp
     */
    @GetMapping("/statistics/by-cinema")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatisticsByCinema() {
        try {
            Map<Long, StatisticsService.CinemaStatisticsDTO> stats = statisticsService.getStatisticsByCinema();
            
            // Convert Map to List for easier frontend consumption
            List<StatisticsService.CinemaStatisticsDTO> statsList = stats.values().stream()
                    .sorted((a, b) -> b.getRevenue().compareTo(a.getRevenue()))
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê theo rạp thành công");
            response.put("data", statsList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Lấy doanh thu và tổng vé bán ra cho một rạp cụ thể
     */
    @GetMapping("/statistics/by-cinema/{complexId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatisticsByCinemaId(@PathVariable Long complexId) {
        try {
            StatisticsService.CinemaStatisticsDTO stats = statisticsService.getStatisticsByCinemaId(complexId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê theo rạp thành công");
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Lấy doanh thu và tổng vé bán ra theo tất cả các phim
     */
    @GetMapping("/statistics/by-movie")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatisticsByMovie() {
        try {
            Map<Long, StatisticsService.MovieStatisticsDTO> stats = statisticsService.getStatisticsByMovie();
            
            // Convert Map to List for easier frontend consumption
            List<StatisticsService.MovieStatisticsDTO> statsList = stats.values().stream()
                    .sorted((a, b) -> b.getRevenue().compareTo(a.getRevenue()))
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê theo phim thành công");
            response.put("data", statsList);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Lấy doanh thu và tổng vé bán ra cho một phim cụ thể
     */
    @GetMapping("/statistics/by-movie/{movieId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatisticsByMovieId(@PathVariable Long movieId) {
        try {
            StatisticsService.MovieStatisticsDTO stats = statisticsService.getStatisticsByMovieId(movieId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thống kê theo phim thành công");
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

