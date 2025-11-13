package com.example.backend.services;

import com.example.backend.dtos.OtpSessionDTO;
import com.example.backend.dtos.ResetTokenSessionDTO;
import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 15;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,32}$");
    private static final String OTP_SESSION_KEY = "FORGOT_PASSWORD_OTP_SESSION";
    private static final String RESET_TOKEN_SESSION_KEY = "PASSWORD_RESET_TOKEN_SESSION";
    
    /**
     * Gửi OTP qua email
     */
    public void sendOtp(String email, HttpSession session) {
        // Kiểm tra email có tồn tại không
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email không tồn tại trong hệ thống");
        }
        
        // Kiểm tra session có OTP cũ không
        OtpSessionDTO existingSession = (OtpSessionDTO) session.getAttribute(OTP_SESSION_KEY);
        if (existingSession != null && existingSession.getEmail().equals(email)) {
            long currentTimeMillis = System.currentTimeMillis();
            long secondsSinceLastSent = (currentTimeMillis - existingSession.getLastSentAtMillis()) / 1000;
            
            if (secondsSinceLastSent < RESEND_COOLDOWN_SECONDS) {
                throw new RuntimeException(
                        "Vui lòng đợi " + (RESEND_COOLDOWN_SECONDS - secondsSinceLastSent) + 
                        " giây trước khi gửi lại OTP");
            }
        }
        
        // Tạo mã OTP mới
        String otpCode = generateOtpCode();
        long currentTimeMillis = System.currentTimeMillis();
        long expiryTimeMillis = currentTimeMillis + (OTP_EXPIRY_MINUTES * 60 * 1000);
        
        // Lưu vào session
        OtpSessionDTO otpSession = new OtpSessionDTO(
                email,
                otpCode,
                currentTimeMillis,
                expiryTimeMillis,
                currentTimeMillis
        );
        
        session.setAttribute(OTP_SESSION_KEY, otpSession);
        
        // Gửi email
        emailService.sendForgotPasswordOtpEmail(email, otpCode);
    }
    
    /**
     * Xác thực OTP
     */
    public String verifyOtp(String email, String otpCode, HttpSession session) {
        // Lấy OTP session
        OtpSessionDTO otpSession = (OtpSessionDTO) session.getAttribute(OTP_SESSION_KEY);
        
        if (otpSession == null) {
            throw new RuntimeException("Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.");
        }
        
        // Kiểm tra email có khớp không
        if (!otpSession.getEmail().equals(email)) {
            throw new RuntimeException("Email không khớp với mã OTP đã gửi");
        }
        
        // Kiểm tra OTP có hết hạn chưa
        long currentTimeMillis = System.currentTimeMillis();
        if (currentTimeMillis > otpSession.getExpiresAtMillis()) {
            session.removeAttribute(OTP_SESSION_KEY);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }
        
        // Kiểm tra mã OTP có đúng không
        if (!otpSession.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không đúng");
        }
        
        // Xóa OTP session sau khi verify thành công
        session.removeAttribute(OTP_SESSION_KEY);
        
        // Tạo reset token và lưu vào session
        String resetToken = UUID.randomUUID().toString();
        long expiryTimeMillis = currentTimeMillis + (RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
        
        ResetTokenSessionDTO resetTokenSession = new ResetTokenSessionDTO(
                resetToken,
                email,
                currentTimeMillis,
                expiryTimeMillis
        );
        
        session.setAttribute(RESET_TOKEN_SESSION_KEY, resetTokenSession);
        
        return resetToken;
    }
    
    /**
     * Đặt lại mật khẩu
     */
    @Transactional
    public void resetPassword(String token, String newPassword, HttpSession session) {
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new RuntimeException("Mật khẩu phải từ 8 đến 32 ký tự và chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số");
        }

        // Lấy reset token từ session
        ResetTokenSessionDTO resetTokenSession = (ResetTokenSessionDTO) session.getAttribute(RESET_TOKEN_SESSION_KEY);
        
        if (resetTokenSession == null) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết phiên làm việc");
        }
        
        // Kiểm tra token có khớp không
        if (!resetTokenSession.getToken().equals(token)) {
            throw new RuntimeException("Token không hợp lệ");
        }
        
        // Kiểm tra token có hết hạn chưa
        long currentTimeMillis = System.currentTimeMillis();
        if (currentTimeMillis > resetTokenSession.getExpiresAtMillis()) {
            session.removeAttribute(RESET_TOKEN_SESSION_KEY);
            throw new RuntimeException("Token đã hết hạn. Vui lòng yêu cầu mã OTP mới.");
        }
        
        // Tìm customer theo email
        User user = userRepository.findByEmail(resetTokenSession.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Xóa reset token session sau khi đổi mật khẩu thành công
        session.removeAttribute(RESET_TOKEN_SESSION_KEY);
        
        // Gửi email xác nhận (optional)
        emailService.sendPasswordResetConfirmationEmail(user.getEmail());
    }
    
    /**
     * Kiểm tra thời gian còn lại của OTP
     */
    public long getOtpRemainingSeconds(HttpSession session) {
        OtpSessionDTO otpSession = (OtpSessionDTO) session.getAttribute(OTP_SESSION_KEY);
        
        if (otpSession == null) {
            return 0;
        }
        
        long currentTimeMillis = System.currentTimeMillis();
        long remainingMillis = otpSession.getExpiresAtMillis() - currentTimeMillis;
        
        return Math.max(0, remainingMillis / 1000);
    }
    
    /**
     * Generate random OTP code
     */
    private String generateOtpCode() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}