package com.example.backend.controllers;

import com.example.backend.dtos.CinemaComplexResponseDTO;
import com.example.backend.dtos.CreateCinemaComplexDTO;
import com.example.backend.services.CinemaComplexService;
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
@RequestMapping("/api/admin/cinema-complexes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowedHeaders = "*", 
             allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class CinemaComplexController {
    
    private final CinemaComplexService cinemaComplexService;
    
    @GetMapping
    public ResponseEntity<?> getAllCinemaComplexes() {
        try {
            List<CinemaComplexResponseDTO> complexes = cinemaComplexService.getAllCinemaComplexes();
            return ResponseEntity.ok(createSuccessResponse("Lấy danh sách cụm rạp thành công", complexes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/{complexId}")
    public ResponseEntity<?> getCinemaComplexById(@PathVariable Long complexId) {
        try {
            CinemaComplexResponseDTO complex = cinemaComplexService.getCinemaComplexById(complexId);
            return ResponseEntity.ok(createSuccessResponse("Lấy thông tin cụm rạp thành công", complex));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCinemaComplex(@Valid @RequestBody CreateCinemaComplexDTO createDTO,
                                                  BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            CinemaComplexResponseDTO response = cinemaComplexService.createCinemaComplex(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                createSuccessResponse("Tạo cụm rạp thành công", response)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{complexId}")
    public ResponseEntity<?> updateCinemaComplex(@PathVariable Long complexId,
                                                @Valid @RequestBody CreateCinemaComplexDTO updateDTO,
                                                BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse(bindingResult));
        }
        
        try {
            CinemaComplexResponseDTO response = cinemaComplexService.updateCinemaComplex(complexId, updateDTO);
            return ResponseEntity.ok(createSuccessResponse("Cập nhật cụm rạp thành công", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{complexId}")
    public ResponseEntity<?> deleteCinemaComplex(@PathVariable Long complexId) {
        try {
            cinemaComplexService.deleteCinemaComplex(complexId);
            return ResponseEntity.ok(createSuccessResponse("Xóa cụm rạp thành công", null));
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

