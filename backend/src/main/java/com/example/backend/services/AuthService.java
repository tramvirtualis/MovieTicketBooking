package com.example.backend.services;

import com.example.backend.dtos.OtpSessionDTO;
import com.example.backend.dtos.RegisterRequestDTO;
import com.example.backend.dtos.RegisterResponseDTO;
import com.example.backend.dtos.ResetTokenSessionDTO;
import com.example.backend.dtos.SendOtpRequestDTO;
import com.example.backend.entities.Customer;
import com.example.backend.repositories.CustomerRepository;
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
public class AuthService {
    
    private final CustomerRepository customerRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    private static final int OTP_LENGTH = 6;
    // Đăng ký tài khoản
    private static final long REGISTER_OTP_VALIDITY_MINUTES = 5;
    private static final long REGISTER_RESEND_COOLDOWN_SECONDS = 30;
    private static final String REGISTER_SESSION_OTP_KEY = "REGISTER_OTP_SESSION";

    // Quên mật khẩu
    private static final int FORGOT_OTP_EXPIRY_MINUTES = 5;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 15;
    private static final int FORGOT_RESEND_COOLDOWN_SECONDS = 60;
    private static final String FORGOT_OTP_SESSION_KEY = "FORGOT_PASSWORD_OTP_SESSION";
    private static final String RESET_TOKEN_SESSION_KEY = "PASSWORD_RESET_TOKEN_SESSION";
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,32}$");
    
    @Transactional
    public String sendOtp(SendOtpRequestDTO request, HttpSession session) {
        String email = request.getEmail();
        
        // Kiểm tra email đã tồn tại trong hệ thống chưa
        if (customerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã được đăng ký");
        }
        
        // Kiểm tra cooldown 30 giây từ session (chỉ áp dụng cho cùng email)
        OtpSessionDTO existingOtp = (OtpSessionDTO) session.getAttribute(REGISTER_SESSION_OTP_KEY);
        long nowMillis = System.currentTimeMillis();
        
        if (existingOtp != null && existingOtp.getEmail().equals(email)) {
            long timeSinceLastSent = (nowMillis - existingOtp.getLastSentAtMillis()) / 1000; // Convert to seconds
            
            if (timeSinceLastSent < REGISTER_RESEND_COOLDOWN_SECONDS) {
                long remainingSeconds = REGISTER_RESEND_COOLDOWN_SECONDS - timeSinceLastSent;
                throw new RuntimeException("Vui lòng đợi " + remainingSeconds + " giây trước khi gửi lại OTP");
            }
        }
        
        // Tạo mã OTP ngẫu nhiên
        String otpCode = generateOtpCode();
        
        // Lưu OTP vào session với thời gian hết hạn 5 phút
        OtpSessionDTO otpSession = new OtpSessionDTO();
        otpSession.setEmail(email);
        otpSession.setOtpCode(otpCode);
        otpSession.setCreatedAtMillis(nowMillis);
        otpSession.setExpiresAtMillis(nowMillis + (REGISTER_OTP_VALIDITY_MINUTES * 60 * 1000)); // 5 minutes in milliseconds
        otpSession.setLastSentAtMillis(nowMillis);
        
        session.setAttribute(REGISTER_SESSION_OTP_KEY, otpSession);
        // Set session timeout là 5 phút (300 giây) + một chút buffer
        session.setMaxInactiveInterval((int) (REGISTER_OTP_VALIDITY_MINUTES * 60));
        
        // Gửi email
        emailService.sendOtpEmail(email, otpCode);
        
        return "Mã OTP đã được gửi đến email của bạn";
    }
    
    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request, HttpSession session) {
        // Validate mật khẩu khớp
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }
        
        // Kiểm tra username đã tồn tại
        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        
        // Kiểm tra email đã tồn tại
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được đăng ký");
        }
        
        // Xác thực OTP từ session
        OtpSessionDTO otpSession = (OtpSessionDTO) session.getAttribute(REGISTER_SESSION_OTP_KEY);
        if (otpSession == null) {
            throw new RuntimeException("Không tìm thấy OTP trong session. Vui lòng gửi lại OTP");
        }
        
        // Kiểm tra email có khớp không
        if (!otpSession.getEmail().equals(request.getEmail())) {
            throw new RuntimeException("Email không khớp với email đã gửi OTP");
        }
        
        // Kiểm tra OTP có khớp không
        if (!otpSession.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không đúng");
        }
        
        // Kiểm tra OTP có hết hạn không
        long nowMillis = System.currentTimeMillis();
        if (nowMillis > otpSession.getExpiresAtMillis()) {
            session.removeAttribute(REGISTER_SESSION_OTP_KEY);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng gửi lại OTP");
        }
        
        // Xóa OTP khỏi session sau khi xác thực thành công
        session.removeAttribute(REGISTER_SESSION_OTP_KEY);
        
        // Tạo customer mới
        Customer customer = Customer.builder()
                .name(request.getFullName())
                .dob(request.getDob())
                .phone(request.getMobile())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(true)
                .build();
        
        Customer savedCustomer = customerRepository.save(customer);
        
        return new RegisterResponseDTO(
                savedCustomer.getUserId(),
                savedCustomer.getUsername(),
                savedCustomer.getEmail(),
                "Đăng ký thành công"
        );
    }
    
    /**
     * Forgot password - Send OTP
     */
    public void sendForgotPasswordOtp(String email, HttpSession session) {
        if (!customerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email không tồn tại trong hệ thống");
        }

        OtpSessionDTO existingSession = (OtpSessionDTO) session.getAttribute(FORGOT_OTP_SESSION_KEY);
        if (existingSession != null && existingSession.getEmail().equals(email)) {
            long currentTimeMillis = System.currentTimeMillis();
            long secondsSinceLastSent = (currentTimeMillis - existingSession.getLastSentAtMillis()) / 1000;

            if (secondsSinceLastSent < FORGOT_RESEND_COOLDOWN_SECONDS) {
                throw new RuntimeException(
                        "Vui lòng đợi " + (FORGOT_RESEND_COOLDOWN_SECONDS - secondsSinceLastSent) +
                        " giây trước khi gửi lại OTP");
            }
        }

        String otpCode = generateOtpCode();
        long currentTimeMillis = System.currentTimeMillis();
        long expiryTimeMillis = currentTimeMillis + (FORGOT_OTP_EXPIRY_MINUTES * 60 * 1000);

        OtpSessionDTO otpSession = new OtpSessionDTO(
                email,
                otpCode,
                currentTimeMillis,
                expiryTimeMillis,
                currentTimeMillis
        );

        session.setAttribute(FORGOT_OTP_SESSION_KEY, otpSession);

        emailService.sendForgotPasswordOtpEmail(email, otpCode);
    }

    /**
     * Forgot password - Verify OTP
     */
    public String verifyForgotPasswordOtp(String email, String otpCode, HttpSession session) {
        OtpSessionDTO otpSession = (OtpSessionDTO) session.getAttribute(FORGOT_OTP_SESSION_KEY);

        if (otpSession == null) {
            throw new RuntimeException("Không tìm thấy mã OTP. Vui lòng yêu cầu mã mới.");
        }

        if (!otpSession.getEmail().equals(email)) {
            throw new RuntimeException("Email không khớp với mã OTP đã gửi");
        }

        long currentTimeMillis = System.currentTimeMillis();
        if (currentTimeMillis > otpSession.getExpiresAtMillis()) {
            session.removeAttribute(FORGOT_OTP_SESSION_KEY);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        }

        if (!otpSession.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không đúng");
        }

        session.removeAttribute(FORGOT_OTP_SESSION_KEY);

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
     * Forgot password - Reset password
     */
    @Transactional
    public void resetForgotPassword(String token, String newPassword, HttpSession session) {
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new RuntimeException("Mật khẩu phải từ 8 đến 32 ký tự và chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số");
        }

        ResetTokenSessionDTO resetTokenSession = (ResetTokenSessionDTO) session.getAttribute(RESET_TOKEN_SESSION_KEY);

        if (resetTokenSession == null) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết phiên làm việc");
        }

        if (!resetTokenSession.getToken().equals(token)) {
            throw new RuntimeException("Token không hợp lệ");
        }

        long currentTimeMillis = System.currentTimeMillis();
        if (currentTimeMillis > resetTokenSession.getExpiresAtMillis()) {
            session.removeAttribute(RESET_TOKEN_SESSION_KEY);
            throw new RuntimeException("Token đã hết hạn. Vui lòng yêu cầu mã OTP mới.");
        }

        Customer customer = customerRepository.findByEmail(resetTokenSession.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        customer.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);

        session.removeAttribute(RESET_TOKEN_SESSION_KEY);

        emailService.sendPasswordResetConfirmationEmail(customer.getEmail());
    }

    /**
     * Forgot password - Get remaining OTP time
     */
    public long getForgotPasswordOtpRemainingSeconds(HttpSession session) {
        OtpSessionDTO otpSession = (OtpSessionDTO) session.getAttribute(FORGOT_OTP_SESSION_KEY);

        if (otpSession == null) {
            return 0;
        }

        long currentTimeMillis = System.currentTimeMillis();
        long remainingMillis = otpSession.getExpiresAtMillis() - currentTimeMillis;

        return Math.max(0, remainingMillis / 1000);
    }
    
    private String generateOtpCode() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }
}