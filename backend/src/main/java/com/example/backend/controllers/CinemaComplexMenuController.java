package com.example.backend.controllers;

import com.example.backend.dtos.FoodComboResponseDTO;
import com.example.backend.services.CinemaComplexMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowedHeaders = "*", 
             allowCredentials = "true")
@PreAuthorize("hasRole('MANAGER')")
public class CinemaComplexMenuController {
    
    private final CinemaComplexMenuService menuService;
    
    @GetMapping("/complex/{complexId}")
    public ResponseEntity<?> getMenuByComplexId(@PathVariable Long complexId) {
        try {
            List<FoodComboResponseDTO> menu = menuService.getMenuByComplexId(complexId);
            return ResponseEntity.ok(createSuccessResponse("Lấy menu thành công", menu));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("không có quyền")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/available/{complexId}")
    public ResponseEntity<?> getAvailableFoodCombos(@PathVariable Long complexId) {
        try {
            List<FoodComboResponseDTO> combos = menuService.getAvailableFoodCombos(complexId);
            return ResponseEntity.ok(createSuccessResponse("Lấy danh sách sản phẩm thành công", combos));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/complex/{complexId}/add/{foodComboId}")
    public ResponseEntity<?> addFoodComboToMenu(@PathVariable Long complexId,
                                                @PathVariable Long foodComboId) {
        try {
            FoodComboResponseDTO added = menuService.addFoodComboToMenu(complexId, foodComboId);
            return ResponseEntity.ok(createSuccessResponse("Thêm sản phẩm vào menu thành công", added));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("không có quyền")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }
    
    @DeleteMapping("/complex/{complexId}/remove/{foodComboId}")
    public ResponseEntity<?> removeFoodComboFromMenu(@PathVariable Long complexId,
                                                      @PathVariable Long foodComboId) {
        try {
            menuService.removeFoodComboFromMenu(complexId, foodComboId);
            return ResponseEntity.ok(createSuccessResponse("Xóa sản phẩm khỏi menu thành công", null));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("không có quyền")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
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


