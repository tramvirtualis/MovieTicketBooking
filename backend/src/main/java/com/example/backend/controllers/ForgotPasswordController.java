package com.example.backend.controllers;

import com.example.backend.dtos.SendOtpRequestDTO;
import com.example.backend.dtos.VerifyOtpRequestDTO;
import com.example.backend.services.ForgotPasswordService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/forgot-password")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ForgotPasswordController {
    
    private final ForgotPasswordService forgotPasswordService;
    
    /**
     * API gửi OTP qua email
     * POST /api/forgot-password/send-otp
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@Valid @RequestBody SendOtpRequestDTO request, 
                                      HttpSession session) {
        try {
            forgotPasswordService.sendOtp(request.getEmail(), session);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Mã OTP đã được gửi đến email của bạn");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra. Vui lòng thử lại sau.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * API gửi lại OTP
     * POST /api/forgot-password/resend-otp
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody SendOtpRequestDTO request, 
                                        HttpSession session) {
        try {
            forgotPasswordService.sendOtp(request.getEmail(), session);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Mã OTP mới đã được gửi đến email của bạn");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra. Vui lòng thử lại sau.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * API xác thực OTP
     * POST /api/forgot-password/verify-otp
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO request, 
                                        HttpSession session) {
        try {
            String resetToken = forgotPasswordService.verifyOtp(
                    request.getEmail(), 
                    request.getOtp(), 
                    session
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xác thực OTP thành công");
            response.put("token", resetToken);
            response.put("email", request.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra. Vui lòng thử lại sau.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * API đặt lại mật khẩu
     * POST /api/forgot-password/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
                                            HttpSession session) {
        try {
            forgotPasswordService.resetPassword(request.getToken(), request.getNewPassword(), session);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đặt lại mật khẩu thành công");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra. Vui lòng thử lại sau.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * API kiểm tra thời gian còn lại của OTP
     * GET /api/forgot-password/otp-remaining-time
     */
    @GetMapping("/otp-remaining-time")
    public ResponseEntity<?> getOtpRemainingTime(HttpSession session) {
        try {
            long remainingSeconds = forgotPasswordService.getOtpRemainingSeconds(session);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("remainingSeconds", remainingSeconds);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Inner class for reset password request
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ResetPasswordRequest {
        @jakarta.validation.constraints.NotBlank(message = "Token không được để trống")
        private String token;
        
        @jakarta.validation.constraints.NotBlank(message = "Mật khẩu mới không được để trống")
        @jakarta.validation.constraints.Size(min = 8, max = 32, message = "Mật khẩu phải từ 8 đến 32 ký tự")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,32}$",
                 message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số")
        private String newPassword;
    }
}