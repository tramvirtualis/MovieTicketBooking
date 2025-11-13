package com.example.backend.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO cho request verify OTP
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequestDTO {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Mã OTP không được để trống")
    @Size(min = 6, max = 6, message = "Mã OTP phải có 6 chữ số")
    private String otp;
}

// DTO cho request reset password
@Data
@NoArgsConstructor
@AllArgsConstructor
class ResetPasswordRequestDTO {
    
    @NotBlank(message = "Token không được để trống")
    private String token;
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String newPassword;
}

// DTO cho response
@Data
@NoArgsConstructor
@AllArgsConstructor
class ApiResponseDTO {
    private Boolean success;
    private String message;
    private Object data;
    
    public ApiResponseDTO(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}

// DTO cho OTP response
@Data
@NoArgsConstructor
@AllArgsConstructor
class VerifyOtpResponseDTO {
    private Boolean success;
    private String message;
    private String token;
    private String email;
}