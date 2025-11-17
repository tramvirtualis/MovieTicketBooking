package com.example.backend.controllers;

import com.example.backend.dtos.CreateShowtimeDTO;
import com.example.backend.dtos.ShowtimeResponseDTO;
import com.example.backend.services.ShowtimeService;
import com.example.backend.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
             allowedHeaders = "*",
             allowCredentials = "true")
public class ShowtimeController {
    
    private final ShowtimeService showtimeService;
    private final JwtUtils jwtUtils;
    
    // ============ MANAGER ENDPOINTS ============
    
    /**
     * Lấy danh sách lịch chiếu theo roomId (Manager)
     */
    @GetMapping("/api/manager/showtimes/room/{roomId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getShowtimesByRoomId(@PathVariable Long roomId) {
        try {
            List<ShowtimeResponseDTO> showtimes = showtimeService.getShowtimesByRoomId(roomId);
            return ResponseEntity.ok(
                createSuccessResponse("Lấy danh sách lịch chiếu thành công", showtimes)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Tạo lịch chiếu mới (Manager)
     */
    @PostMapping("/api/manager/showtimes")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> createShowtime(@Valid @RequestBody CreateShowtimeDTO createDTO,
                                            BindingResult bindingResult,
                                            HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            // Lấy username từ JWT token
            String username = getUsernameFromRequest(request);
            ShowtimeResponseDTO showtimeResponse = showtimeService.createShowtime(createDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                createSuccessResponse("Tạo lịch chiếu thành công", showtimeResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }
    
    /**
     * Cập nhật lịch chiếu (Manager)
     */
    @PutMapping("/api/manager/showtimes/{showtimeId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> updateShowtime(@PathVariable Long showtimeId,
                                            @Valid @RequestBody CreateShowtimeDTO updateDTO,
                                            BindingResult bindingResult,
                                            HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            // Lấy username từ JWT token
            String username = getUsernameFromRequest(request);
            ShowtimeResponseDTO showtimeResponse = showtimeService.updateShowtime(showtimeId, updateDTO, username);
            return ResponseEntity.ok(
                createSuccessResponse("Cập nhật lịch chiếu thành công", showtimeResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Xóa lịch chiếu (Manager)
     */
    @DeleteMapping("/api/manager/showtimes/{showtimeId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> deleteShowtime(@PathVariable Long showtimeId,
                                            HttpServletRequest request) {
        try {
            // Lấy username từ JWT token
            String username = getUsernameFromRequest(request);
            showtimeService.deleteShowtime(showtimeId, username);
            return ResponseEntity.ok(
                createSuccessResponse("Xóa lịch chiếu thành công", null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    // ============ ADMIN ENDPOINTS (Optional - for future use) ============
    
    /**
     * Lấy danh sách lịch chiếu theo roomId (Admin)
     */
    @GetMapping("/api/admin/showtimes/room/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getShowtimesByRoomIdAdmin(@PathVariable Long roomId) {
        try {
            List<ShowtimeResponseDTO> showtimes = showtimeService.getShowtimesByRoomId(roomId);
            return ResponseEntity.ok(
                createSuccessResponse("Lấy danh sách lịch chiếu thành công", showtimes)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Tạo lịch chiếu mới (Admin)
     */
    @PostMapping("/api/admin/showtimes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createShowtimeAdmin(@Valid @RequestBody CreateShowtimeDTO createDTO,
                                                 BindingResult bindingResult,
                                                 HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            // Lấy username từ JWT token
            String username = getUsernameFromRequest(request);
            ShowtimeResponseDTO showtimeResponse = showtimeService.createShowtime(createDTO, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                createSuccessResponse("Tạo lịch chiếu thành công", showtimeResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }
    
    /**
     * Cập nhật lịch chiếu (Admin)
     */
    @PutMapping("/api/admin/showtimes/{showtimeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateShowtimeAdmin(@PathVariable Long showtimeId,
                                                 @Valid @RequestBody CreateShowtimeDTO updateDTO,
                                                 BindingResult bindingResult,
                                                 HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            // Lấy username từ JWT token
            String username = getUsernameFromRequest(request);
            ShowtimeResponseDTO showtimeResponse = showtimeService.updateShowtime(showtimeId, updateDTO, username);
            return ResponseEntity.ok(
                createSuccessResponse("Cập nhật lịch chiếu thành công", showtimeResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Xóa lịch chiếu (Admin)
     */
    @DeleteMapping("/api/admin/showtimes/{showtimeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteShowtimeAdmin(@PathVariable Long showtimeId,
                                                 HttpServletRequest request) {
        try {
            // Lấy username từ JWT token
            String username = getUsernameFromRequest(request);
            showtimeService.deleteShowtime(showtimeId, username);
            return ResponseEntity.ok(
                createSuccessResponse("Xóa lịch chiếu thành công", null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    // Helper methods
    private String getUsernameFromRequest(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtils.validateJwtToken(token)) {
                    return jwtUtils.getUsernameFromJwtToken(token);
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting username from request: " + e.getMessage());
        }
        return null;
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
    
    private Map<String, Object> createErrorResponse(BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Dữ liệu không hợp lệ");
        response.put("errors", bindingResult.getFieldErrors().stream()
            .collect(Collectors.toMap(
                error -> error.getField(),
                error -> error.getDefaultMessage()
            )));
        return response;
    }
}

