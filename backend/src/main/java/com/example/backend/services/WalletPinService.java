package com.example.backend.services;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dtos.CreatePinRequestDTO;
import com.example.backend.dtos.PinStatusResponseDTO;
import com.example.backend.dtos.UpdatePinRequestDTO;
import com.example.backend.dtos.VerifyPinRequestDTO;
import com.example.backend.entities.Customer;
import com.example.backend.entities.WalletPin;
import com.example.backend.repositories.CustomerRepository;
import com.example.backend.repositories.WalletPinRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service để quản lý mã PIN của ví Cinesmart
 * Sử dụng BCrypt để hash PIN, đảm bảo bảo mật tuyệt đối
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WalletPinService {

    private final WalletPinRepository walletPinRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    // Cấu hình bảo mật
    private static final int MAX_FAILED_ATTEMPTS = 5; // Số lần nhập sai tối đa
    private static final int LOCK_DURATION_MINUTES = 30; // Thời gian lock (phút)

    /**
     * Kiểm tra xem customer đã có PIN chưa
     */
    @Transactional(readOnly = true)
    public boolean hasPin(Long userId) {
        return walletPinRepository.existsByCustomerUserId(userId);
    }

    /**
     * Lấy trạng thái PIN của customer
     */
    @Transactional(readOnly = true)
    public PinStatusResponseDTO getPinStatus(Long userId) {
        Optional<WalletPin> pinOpt = walletPinRepository.findByCustomerUserId(userId);
        
        if (pinOpt.isEmpty()) {
            return PinStatusResponseDTO.builder()
                    .hasPin(false)
                    .locked(false)
                    .failedAttempts(0)
                    .build();
        }

        WalletPin pin = pinOpt.get();
        boolean isLocked = isLocked(pin);

        return PinStatusResponseDTO.builder()
                .hasPin(true)
                .locked(isLocked)
                .failedAttempts(pin.getFailedAttempts())
                .build();
    }

    /**
     * Tạo mã PIN mới
     * PIN được hash bằng BCrypt trước khi lưu vào database
     */
    @Transactional
    public void createPin(Long userId, CreatePinRequestDTO request) {
        // Validate PIN và confirm PIN khớp nhau
        if (!request.getPin().equals(request.getConfirmPin())) {
            throw new IllegalArgumentException("Mã PIN và xác nhận mã PIN không khớp");
        }

        // Kiểm tra xem đã có PIN chưa
        if (walletPinRepository.existsByCustomerUserId(userId)) {
            throw new IllegalStateException("Bạn đã có mã PIN. Vui lòng sử dụng chức năng đổi mã PIN.");
        }

        // Lấy customer
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        // Hash PIN bằng BCrypt (tự động có salt)
        // KHÔNG BAO GIỜ log PIN dạng plain text
        String hashedPin = passwordEncoder.encode(request.getPin());
        
        log.info("Creating PIN for customer ID: {}", userId);
        // KHÔNG log PIN, chỉ log việc tạo PIN

        // Tạo và lưu PIN
        WalletPin walletPin = WalletPin.builder()
                .customer(customer)
                .hashedPin(hashedPin)
                .failedAttempts(0)
                .lockedUntil(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        walletPinRepository.save(walletPin);
        log.info("PIN created successfully for customer ID: {}", userId);
    }

    /**
     * Cập nhật mã PIN
     * Yêu cầu nhập đúng PIN cũ
     */
    @Transactional
    public void updatePin(Long userId, UpdatePinRequestDTO request) {
        // Validate new PIN và confirm PIN khớp nhau
        if (!request.getNewPin().equals(request.getConfirmPin())) {
            throw new IllegalArgumentException("Mã PIN mới và xác nhận mã PIN mới không khớp");
        }

        // Validate new PIN khác current PIN
        if (request.getCurrentPin().equals(request.getNewPin())) {
            throw new IllegalArgumentException("Mã PIN mới phải khác mã PIN hiện tại");
        }

        // Lấy PIN hiện tại
        WalletPin walletPin = walletPinRepository.findByCustomerUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Bạn chưa có mã PIN. Vui lòng tạo mã PIN trước."));

        // Kiểm tra xem có bị lock không
        if (isLocked(walletPin)) {
            throw new IllegalStateException("Mã PIN của bạn đang bị khóa. Vui lòng thử lại sau " + 
                    getRemainingLockTime(walletPin) + " phút.");
        }

        // Xác thực PIN hiện tại
        if (!passwordEncoder.matches(request.getCurrentPin(), walletPin.getHashedPin())) {
            // Tăng số lần nhập sai
            walletPin.setFailedAttempts(walletPin.getFailedAttempts() + 1);
            
            // Nếu vượt quá số lần cho phép, lock PIN
            if (walletPin.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                walletPin.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                log.warn("PIN locked for customer ID: {} due to too many failed attempts", userId);
                walletPinRepository.save(walletPin);
                throw new IllegalStateException("Bạn đã nhập sai mã PIN quá nhiều lần. Mã PIN đã bị khóa trong " + 
                        LOCK_DURATION_MINUTES + " phút.");
            }
            
            walletPinRepository.save(walletPin);
            int remainingAttempts = MAX_FAILED_ATTEMPTS - walletPin.getFailedAttempts();
            throw new IllegalArgumentException("Mã PIN hiện tại không đúng. Còn " + remainingAttempts + " lần thử.");
        }

        // PIN đúng, reset failed attempts và hash PIN mới
        String hashedNewPin = passwordEncoder.encode(request.getNewPin());
        
        walletPin.setHashedPin(hashedNewPin);
        walletPin.setFailedAttempts(0); // Reset failed attempts
        walletPin.setLockedUntil(null); // Unlock nếu đang bị lock
        walletPin.setUpdatedAt(LocalDateTime.now());

        walletPinRepository.save(walletPin);
        log.info("PIN updated successfully for customer ID: {}", userId);
    }

    /**
     * Xác thực mã PIN (dùng cho các giao dịch quan trọng)
     * Trả về true nếu PIN đúng, false nếu sai
     * Tự động tăng failed attempts và lock nếu cần
     */
    @Transactional
    public boolean verifyPin(Long userId, VerifyPinRequestDTO request) {
        WalletPin walletPin = walletPinRepository.findByCustomerUserId(userId)
                .orElseThrow(() -> new IllegalStateException("Bạn chưa có mã PIN. Vui lòng tạo mã PIN trước."));

        // Kiểm tra xem có bị lock không
        if (isLocked(walletPin)) {
            throw new IllegalStateException("Mã PIN của bạn đang bị khóa. Vui lòng thử lại sau " + 
                    getRemainingLockTime(walletPin) + " phút.");
        }

        // Xác thực PIN
        boolean isValid = passwordEncoder.matches(request.getPin(), walletPin.getHashedPin());

        if (isValid) {
            // PIN đúng, reset failed attempts
            walletPin.setFailedAttempts(0);
            walletPin.setLockedUntil(null);
            walletPinRepository.save(walletPin);
            log.info("PIN verified successfully for customer ID: {}", userId);
            return true;
        } else {
            // PIN sai, tăng failed attempts
            walletPin.setFailedAttempts(walletPin.getFailedAttempts() + 1);
            
            // Nếu vượt quá số lần cho phép, lock PIN
            if (walletPin.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                walletPin.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                log.warn("PIN locked for customer ID: {} due to too many failed attempts", userId);
                walletPinRepository.save(walletPin);
                throw new IllegalStateException("Bạn đã nhập sai mã PIN quá nhiều lần. Mã PIN đã bị khóa trong " + 
                        LOCK_DURATION_MINUTES + " phút.");
            }
            
            walletPinRepository.save(walletPin);
            int remainingAttempts = MAX_FAILED_ATTEMPTS - walletPin.getFailedAttempts();
            throw new IllegalArgumentException("Mã PIN không đúng. Còn " + remainingAttempts + " lần thử.");
        }
    }

    /**
     * Kiểm tra xem PIN có đang bị lock không
     */
    private boolean isLocked(WalletPin walletPin) {
        if (walletPin.getLockedUntil() == null) {
            return false;
        }
        
        // Nếu thời gian lock đã hết, tự động unlock
        if (LocalDateTime.now().isAfter(walletPin.getLockedUntil())) {
            walletPin.setLockedUntil(null);
            walletPin.setFailedAttempts(0);
            walletPinRepository.save(walletPin);
            return false;
        }
        
        return true;
    }

    /**
     * Tính thời gian còn lại của lock (phút)
     */
    private long getRemainingLockTime(WalletPin walletPin) {
        if (walletPin.getLockedUntil() == null) {
            return 0;
        }
        
        long minutes = java.time.Duration.between(LocalDateTime.now(), walletPin.getLockedUntil()).toMinutes();
        return Math.max(0, minutes);
    }
}

