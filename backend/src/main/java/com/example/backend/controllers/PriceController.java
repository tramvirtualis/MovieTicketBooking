package com.example.backend.controllers;

import com.example.backend.dtos.PriceRequestDTO;
import com.example.backend.entities.Price;
import com.example.backend.services.PriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        allowCredentials = "true"
)
public class PriceController {

    private final PriceService priceService;

    // ================= ADMIN ENDPOINTS =================

    @GetMapping("/api/admin/prices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPrices() {
        try {
            List<Price> prices = priceService.getAll();
            return ResponseEntity.ok(createSuccessResponse("Lấy bảng giá thành công", prices));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // Lưu toàn bộ bảng giá
    @PostMapping("/api/admin/prices/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveAllPrices(@RequestBody List<@Valid PriceRequestDTO> requestList) {
        try {
            List<Price> saved = priceService.saveAll(requestList);
            return ResponseEntity.ok(createSuccessResponse("Cập nhật bảng giá thành công", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    // ================= HELPER RESPONSES =================

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", message);
        if (data != null) res.put("data", data);
        return res;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", false);
        res.put("message", message);
        return res;
    }
}
