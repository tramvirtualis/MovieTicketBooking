package com.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã OTP đăng ký tài khoản Cinesmart");
            message.setText(buildOtpEmailContent(otpCode));
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }
    
    private String buildOtpEmailContent(String otpCode) {
        return String.format("""
                Xin chào,
                
                Mã OTP của bạn để đăng ký tài khoản Cinesmart là: %s
                
                Mã OTP này có hiệu lực trong 5 phút.
                
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                
                Trân trọng,
                Đội ngũ Cinesmart
                """, otpCode);
    }
}