package com.example.backend.controllers;

import com.example.backend.dtos.CreateReviewDTO;
import com.example.backend.dtos.ReviewResponseDTO;
import com.example.backend.services.ReviewService;
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
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowedHeaders = "*", 
             allowCredentials = "true")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> createReview(@Valid @RequestBody CreateReviewDTO createReviewDTO,
                                          BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                createErrorResponse(bindingResult)
            );
        }
        
        try {
            ReviewResponseDTO reviewResponse = reviewService.createReview(createReviewDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                createSuccessResponse("Đánh giá thành công", reviewResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }
    
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getReviewsByMovie(@PathVariable Long movieId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByMovie(movieId);
            return ResponseEntity.ok(
                createSuccessResponse("Lấy danh sách đánh giá thành công", reviews)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> getReviewsByUser(@PathVariable Long userId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByUser(userId);
            return ResponseEntity.ok(
                createSuccessResponse("Lấy danh sách đánh giá thành công", reviews)
            );
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


