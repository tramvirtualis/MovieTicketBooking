package com.example.backend.controllers;

import com.example.backend.dtos.CinemaComplexResponseDTO;
import com.example.backend.entities.Manager;
import com.example.backend.repositories.ManagerRepository;
import com.example.backend.services.CinemaComplexService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
            // Lấy username từ SecurityContext
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("=== DEBUG: Getting cinema complex for manager: " + username + " ===");
            
            // Cách 1: Thử native query để lấy cinema_complex_id trực tiếp (ưu tiên - đáng tin cậy nhất)
            // Native query đảm bảo chỉ query từ bảng managers, tránh ClassCastException
            System.out.println("=== STEP 1: Native query to get cinema_complex_id ===");
            System.out.println("Querying managers table directly for username: " + username);
            
            Optional<Long> complexIdOpt = managerRepository.findCinemaComplexIdByUsername(username);
            
            if (complexIdOpt.isPresent() && complexIdOpt.get() != null) {
                Long complexId = complexIdOpt.get();
                System.out.println("✓ SUCCESS: Found cinema_complex_id: " + complexId);
                
                try {
                    CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
                    System.out.println("=== STEP 2: Cinema complex retrieved successfully ===");
                    System.out.println("✓ ComplexId: " + complex.getComplexId());
                    System.out.println("✓ Name: " + (complex.getName() != null ? complex.getName() : "NULL"));
                    System.out.println("✓ FullAddress: " + (complex.getFullAddress() != null ? complex.getFullAddress() : "NULL"));
                    System.out.println("✓ AddressDescription: " + (complex.getAddressDescription() != null ? complex.getAddressDescription() : "NULL"));
                    System.out.println("✓ AddressProvince: " + (complex.getAddressProvince() != null ? complex.getAddressProvince() : "NULL"));
                    
                    // Trả về array với 1 phần tử
                    List<CinemaComplexResponseDTO> resultList = List.of(complex);
                    System.out.println("=== STEP 3: Creating response ===");
                    System.out.println("✓ Response data size: " + resultList.size());
                    
                    Map<String, Object> response = createSuccessResponse("Lấy thông tin cụm rạp thành công", resultList);
                    System.out.println("✓ Response keys: " + response.keySet());
                    System.out.println("✓ Response data type: " + (response.get("data") != null ? response.get("data").getClass().getName() : "null"));
                    System.out.println("✓ Response data content: " + response.get("data"));
                    
                    return ResponseEntity.ok(response);
                } catch (Exception e) {
                    System.out.println("✗ ERROR getting cinema complex by ID: " + e.getMessage());
                    System.out.println("✗ Exception type: " + e.getClass().getName());
                    e.printStackTrace();
                }
            } else {
                System.out.println("✗ Native query returned empty");
                System.out.println("✗ Manager may not have cinema_complex_id assigned in database");
                System.out.println("✗ Please check: SELECT cinema_complex_id FROM managers m INNER JOIN users u ON m.user_id = u.user_id WHERE u.username = '" + username + "'");
            }
            
            // Cách 2: Thử query Manager với fetch
            System.out.println("DEBUG: Step 1 (fallback) - Trying findByUsernameWithCinemaComplex...");
            Optional<Manager> managerOpt = managerRepository.findByUsernameWithCinemaComplex(username);
            System.out.println("DEBUG: findByUsernameWithCinemaComplex result: " + (managerOpt.isPresent() ? "found" : "not found"));
            
            if (managerOpt.isPresent()) {
                Manager manager = managerOpt.get();
                System.out.println("DEBUG: Manager userId: " + manager.getUserId());
                System.out.println("DEBUG: Manager username: " + manager.getUsername());
                
                // Kiểm tra cinemaComplex
                if (manager.getCinemaComplex() != null) {
                    Long complexId = manager.getCinemaComplex().getComplexId();
                    System.out.println("DEBUG: Manager has cinemaComplex with ID: " + complexId);
                    
                    try {
                        CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
                        System.out.println("DEBUG: Cinema complex retrieved - Name: " + complex.getName());
                        return ResponseEntity.ok(createSuccessResponse("Lấy thông tin cụm rạp thành công", List.of(complex)));
                    } catch (Exception e) {
                        System.out.println("DEBUG: Error getting cinema complex by ID: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.out.println("DEBUG: Manager cinemaComplex is NULL");
                }
            }
            
            // Cách 3: Thử query Manager thông thường
            System.out.println("DEBUG: Step 1 (fallback 2) - Trying regular findByUsername...");
            managerOpt = managerRepository.findByUsername(username);
            if (managerOpt.isPresent()) {
                Manager manager = managerOpt.get();
                System.out.println("DEBUG: Manager found via regular query, userId: " + manager.getUserId());
                
                // Thử truy cập cinemaComplex (có thể là lazy loading)
                try {
                    if (manager.getCinemaComplex() != null) {
                        Long complexId = manager.getCinemaComplex().getComplexId();
                        System.out.println("DEBUG: Manager has cinemaComplex (lazy loaded): " + complexId);
                        CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
                        return ResponseEntity.ok(createSuccessResponse("Lấy thông tin cụm rạp thành công", List.of(complex)));
                    } else {
                        System.out.println("DEBUG: Manager cinemaComplex is NULL (even after regular query)");
                    }
                } catch (Exception e) {
                    System.out.println("DEBUG: Error accessing cinemaComplex (might be lazy loading issue): " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("DEBUG: Manager not found via regular query");
            }
            
            System.out.println("=== DEBUG: No cinema complex found for manager ===");
            return ResponseEntity.ok(createSuccessResponse("Manager chưa được gán cụm rạp", List.of()));
        } catch (Exception e) {
            System.out.println("=== DEBUG: Exception occurred ===");
            System.out.println("DEBUG: Exception message: " + e.getMessage());
            System.out.println("DEBUG: Exception class: " + e.getClass().getName());
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

