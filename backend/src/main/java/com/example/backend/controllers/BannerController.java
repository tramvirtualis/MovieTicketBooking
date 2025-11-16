package com.example.backend.controllers;

import com.example.backend.dtos.BannerResponseDTO;
import com.example.backend.dtos.CreateBannerDTO;
import com.example.backend.dtos.UpdateBannerDTO;
import com.example.backend.services.BannerService;
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
public class BannerController {
    
    private final BannerService bannerService;
    
    // ============ ADMIN ENDPOINTS ============
    
    @PostMapping("/api/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createBanner(@Valid @RequestBody CreateBannerDTO createDTO,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    createErrorResponse(bindingResult)
            );
        }
        
        try {
            BannerResponseDTO bannerResponse = bannerService.createBanner(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    createSuccessResponse("Tạo banner thành công", bannerResponse)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/api/admin/banners/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBanner(@PathVariable Long bannerId,
                                         @Valid @RequestBody UpdateBannerDTO updateDTO,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    createErrorResponse(bindingResult)
            );
        }
        
        try {
            BannerResponseDTO bannerResponse = bannerService.updateBanner(bannerId, updateDTO);
            return ResponseEntity.ok(
                    createSuccessResponse("Cập nhật banner thành công", bannerResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/api/admin/banners/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBanner(@PathVariable Long bannerId) {
        try {
            bannerService.deleteBanner(bannerId);
            return ResponseEntity.ok(
                    createSuccessResponse("Xóa banner thành công", null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/api/admin/banners/{bannerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBannerById(@PathVariable Long bannerId) {
        try {
            BannerResponseDTO bannerResponse = bannerService.getBannerById(bannerId);
            return ResponseEntity.ok(
                    createSuccessResponse("Lấy thông tin banner thành công", bannerResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/api/admin/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllBanners() {
        try {
            List<BannerResponseDTO> banners = bannerService.getAllBanners();
            return ResponseEntity.ok(
                    createSuccessResponse("Lấy danh sách banner thành công", banners)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    // ============ PUBLIC ENDPOINTS ============
    
    @GetMapping("/api/public/banners")
    public ResponseEntity<List<BannerResponseDTO>> getPublicBanners() {
        List<BannerResponseDTO> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(banners);
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

