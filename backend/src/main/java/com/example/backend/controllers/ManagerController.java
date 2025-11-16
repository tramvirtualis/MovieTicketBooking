package com.example.backend.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dtos.CinemaComplexResponseDTO;
import com.example.backend.entities.Manager;
import com.example.backend.repositories.ManagerRepository;
import com.example.backend.services.CinemaComplexService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
             allowedHeaders = "*",
             allowCredentials = "true")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {
    
    private final CinemaComplexService cinemaComplexService;
    private final ManagerRepository managerRepository;
    
    @GetMapping("/cinema-complex")
    public ResponseEntity<?> getManagerCinemaComplex() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Native query để lấy cinema_complex_id trực tiếp
            Optional<Long> complexIdOpt = managerRepository.findCinemaComplexIdByUsername(username);
            
            if (complexIdOpt.isPresent() && complexIdOpt.get() != null) {
                Long complexId = complexIdOpt.get();
                
                try {
                    CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
                    List<CinemaComplexResponseDTO> resultList = List.of(complex);
                    return ResponseEntity.ok(createSuccessResponse("Lấy thông tin cụm rạp thành công", resultList));
                } catch (Exception e) {
                    System.out.println("Error getting cinema complex by ID: " + e.getMessage());
                }
            }
            
            // Fallback: Thử query Manager với fetch
            Optional<Manager> managerOpt = managerRepository.findByUsernameWithCinemaComplex(username);
            
            if (managerOpt.isPresent()) {
                Manager manager = managerOpt.get();
                
                if (manager.getCinemaComplex() != null) {
                    Long complexId = manager.getCinemaComplex().getComplexId();
                    
                    try {
                        CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
                        return ResponseEntity.ok(createSuccessResponse("Lấy thông tin cụm rạp thành công", List.of(complex)));
                    } catch (Exception e) {
                        System.out.println("Error getting cinema complex: " + e.getMessage());
                    }
                }
            }
            
            // Fallback 2: Query Manager thông thường
            managerOpt = managerRepository.findByUsername(username);
            if (managerOpt.isPresent()) {
                Manager manager = managerOpt.get();
                
                try {
                    if (manager.getCinemaComplex() != null) {
                        Long complexId = manager.getCinemaComplex().getComplexId();
                        CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
                        return ResponseEntity.ok(createSuccessResponse("Lấy thông tin cụm rạp thành công", List.of(complex)));
                    }
                } catch (Exception e) {
                    System.out.println("Error accessing cinema complex: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(createSuccessResponse("Manager chưa được gán cụm rạp", List.of()));
        } catch (Exception e) {
            System.out.println("Exception in getManagerCinemaComplex: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse("Lỗi: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}