package com.example.backend.controllers;

import com.example.backend.dtos.RegisterRequestDTO;
import com.example.backend.dtos.RegisterResponseDTO;
import com.example.backend.dtos.SendOtpRequestDTO;
import com.example.backend.services.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowedHeaders = "*", 
             allowCredentials = "true")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequestDTO request,
                                      BindingResult bindingResult,
                                      HttpSession session) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    createErrorResponse(bindingResult)
            );
        }
        
        try {
            String message = authService.sendOtp(request, session);
            return ResponseEntity.ok(createSuccessResponse(message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request,
                                       BindingResult bindingResult,
                                       HttpSession session) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    createErrorResponse(bindingResult)
            );
        }
        
        try {
            RegisterResponseDTO response = authService.register(request, session);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
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