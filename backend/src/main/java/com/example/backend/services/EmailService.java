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
    
    /**
     * Gửi OTP cho đăng ký tài khoản
     */
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
    
    /**
     * Gửi OTP cho quên mật khẩu
     */
    public void sendForgotPasswordOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã OTP đặt lại mật khẩu Cinesmart");
            message.setText(buildForgotPasswordOtpContent(otpCode));
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }
    
    /**
     * Xác nhận đặt lại mật khẩu thành công
     */
    public void sendPasswordResetConfirmationEmail(String toEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mật khẩu của bạn đã được đặt lại thành công");
            message.setText(buildPasswordResetConfirmationContent());
            
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Không thể gửi email xác nhận: " + e.getMessage());
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
    
    private String buildForgotPasswordOtpContent(String otpCode) {
        return String.format("""
                Xin chào,
                
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Cinesmart của mình.
                
                Mã OTP của bạn là: %s
                
                Mã OTP này có hiệu lực trong 5 phút.
                
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
                
                Trân trọng,
                Đội ngũ Cinesmart
                """, otpCode);
    }
    
    private String buildPasswordResetConfirmationContent() {
        return """
                Xin chào,
                
                Mật khẩu cho tài khoản Cinesmart của bạn đã được đặt lại thành công.
                
                Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo mật tài khoản của bạn.
                
                Trân trọng,
                Đội ngũ Cinesmart
                """;
    }
}