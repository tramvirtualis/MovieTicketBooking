package com.example.backend.controllers;

import com.example.backend.dtos.ActivityLogResponseDTO;
import com.example.backend.entities.enums.Action;
import com.example.backend.entities.enums.ObjectType;
import com.example.backend.services.ActivityLogService;
import com.example.backend.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
             allowedHeaders = "*",
             allowCredentials = "true")
public class ActivityLogController {
    
    private final ActivityLogService activityLogService;
    private final JwtUtils jwtUtils;
    
    /**
     * Admin endpoint: Lấy tất cả hoạt động của admin
     * Có thể filter theo username, action, objectType, khoảng thời gian
     */
    @GetMapping("/api/admin/activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllActivities(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Action action,
            @RequestParam(required = false) ObjectType objectType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Integer days) {
        
        try {
            // Nếu có days, tính startDate từ hiện tại
            if (days != null && days > 0) {
                startDate = LocalDateTime.now().minusDays(days);
                endDate = LocalDateTime.now();
            }
            
            List<ActivityLogResponseDTO> activities = activityLogService.getAllActivities(
                    username, action, objectType, startDate, endDate
            );
            
            return ResponseEntity.ok(createSuccessResponse("Lấy danh sách hoạt động thành công", activities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Test endpoint: Tạo activity log thủ công để test
     * Chỉ dùng cho testing, có thể xóa sau
     */
    @PostMapping("/api/admin/activities/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testLogActivity(HttpServletRequest request) {
        try {
            // Lấy username từ JWT token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Token không hợp lệ"));
            }
            
            String token = authHeader.substring(7);
            if (!jwtUtils.validateJwtToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Token không hợp lệ"));
            }
            
            String username = jwtUtils.getUsernameFromJwtToken(token);
            
            log.info("Test logging activity - username: {}", username);
            
            // Log test activity
            activityLogService.logActivity(
                username,
                com.example.backend.entities.enums.Action.CREATE,
                com.example.backend.entities.enums.ObjectType.MOVIE,
                999L,
                "Test Movie",
                "Test activity log"
            );
            
            return ResponseEntity.ok(createSuccessResponse("Test activity logged successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Error: " + e.getMessage()));
        }
    }

    // ============ HELPER METHODS ============
    
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}

