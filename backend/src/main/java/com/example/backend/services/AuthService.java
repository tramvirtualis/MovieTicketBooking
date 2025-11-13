package com.example.backend.services;

import com.example.backend.dtos.*;
import com.example.backend.entities.Admin;
import com.example.backend.entities.Customer;
import com.example.backend.entities.Manager;
import com.example.backend.entities.User;
import com.example.backend.repositories.CustomerRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.utils.JwtUtils;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final CustomerRepository customerRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    
    private static final int OTP_LENGTH = 6;
    private static final long OTP_VALIDITY_MINUTES = 5;
    private static final long RESEND_COOLDOWN_SECONDS = 30;
    private static final String SESSION_OTP_KEY = "otp_session";
    
    @Transactional
    public String sendOtp(SendOtpRequestDTO request, HttpSession session) {
        String email = request.getEmail();
        
        // Kiểm tra email đã tồn tại trong hệ thống chưa
        if (customerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email đã được đăng ký");
        }
        
        // Kiểm tra cooldown 30 giây từ session (chỉ áp dụng cho cùng email)
        OtpSessionDTO existingOtp = (OtpSessionDTO) session.getAttribute(SESSION_OTP_KEY);
        long nowMillis = System.currentTimeMillis();
        
        if (existingOtp != null && existingOtp.getEmail().equals(email)) {
            long timeSinceLastSent = (nowMillis - existingOtp.getLastSentAtMillis()) / 1000; // Convert to seconds
            
            if (timeSinceLastSent < RESEND_COOLDOWN_SECONDS) {
                long remainingSeconds = RESEND_COOLDOWN_SECONDS - timeSinceLastSent;
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
        otpSession.setExpiresAtMillis(nowMillis + (OTP_VALIDITY_MINUTES * 60 * 1000)); // 5 minutes in milliseconds
        otpSession.setLastSentAtMillis(nowMillis);
        
        session.setAttribute(SESSION_OTP_KEY, otpSession);
        // Set session timeout là 5 phút (300 giây) + một chút buffer
        session.setMaxInactiveInterval((int) (OTP_VALIDITY_MINUTES * 60));
        
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
        OtpSessionDTO otpSession = (OtpSessionDTO) session.getAttribute(SESSION_OTP_KEY);
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
            session.removeAttribute(SESSION_OTP_KEY);
            throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng gửi lại OTP");
        }
        
        // Xóa OTP khỏi session sau khi xác thực thành công
        session.removeAttribute(SESSION_OTP_KEY);
        
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
    
    private String generateOtpCode() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        
        return otp.toString();
    }

    public LoginResponseDTO login(String username, String password) throws Exception {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new Exception("Invalid username or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid username or password");
        }

        String role;
        if (user instanceof Admin) role = "ADMIN";
        else if (user instanceof Manager) role = "MANAGER";
        else role = "CUSTOMER";

        String token = jwtUtils.generateJwtToken(username, role);

        return LoginResponseDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .address(user.getAddress())
                .role(role)
                .token(token)
                .build();
    }
}