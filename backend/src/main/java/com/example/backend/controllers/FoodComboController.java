package com.example.backend.controllers;

import com.example.backend.dtos.CreateFoodComboDTO;
import com.example.backend.dtos.FoodComboResponseDTO;
import com.example.backend.services.FoodComboService;
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
@RequestMapping("/api/admin/food-combos")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowedHeaders = "*", 
             allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class FoodComboController {
    
    private final FoodComboService foodComboService;
    
    @PostMapping
    public ResponseEntity<?> createFoodCombo(@Valid @RequestBody CreateFoodComboDTO createDTO,
                                            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            FoodComboResponseDTO response = foodComboService.createFoodCombo(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                createSuccessResponse("Tạo sản phẩm thành công", response)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFoodCombo(@PathVariable Long id,
                                            @Valid @RequestBody CreateFoodComboDTO updateDTO,
                                            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            FoodComboResponseDTO response = foodComboService.updateFoodCombo(id, updateDTO);
            return ResponseEntity.ok(createSuccessResponse("Cập nhật sản phẩm thành công", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllFoodCombos() {
        try {
            List<FoodComboResponseDTO> combos = foodComboService.getAllFoodCombos();
            return ResponseEntity.ok(createSuccessResponse("Lấy danh sách sản phẩm thành công", combos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getFoodComboById(@PathVariable Long id) {
        try {
            FoodComboResponseDTO combo = foodComboService.getFoodComboById(id);
            return ResponseEntity.ok(createSuccessResponse("Lấy thông tin sản phẩm thành công", combo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFoodCombo(@PathVariable Long id) {
        try {
            foodComboService.deleteFoodCombo(id);
            return ResponseEntity.ok(createSuccessResponse("Xóa sản phẩm thành công", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
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
    
    private Map<String, Object> createErrorResponse(BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        
        String errors = bindingResult.getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        
        response.put("message", errors);
        return response;
    }
}

