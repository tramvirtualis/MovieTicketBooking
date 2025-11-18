package com.example.backend.controllers;

import com.example.backend.config.VnPayProperties;
import com.example.backend.dtos.CreateVnPayPaymentRequest;
import com.example.backend.dtos.PaymentOrderResponseDTO;
import com.example.backend.entities.Order;
import com.example.backend.entities.User;
import com.example.backend.entities.Voucher;
import com.example.backend.entities.enums.OrderStatus;
import com.example.backend.entities.enums.PaymentMethod;
import com.example.backend.repositories.UserRepository;
import com.example.backend.repositories.VoucherRepository;
import com.example.backend.services.OrderService;
import com.example.backend.services.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        allowCredentials = "true")
public class PaymentController {

    private static final DateTimeFormatter PAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final OrderService orderService;
    private final VnPayService vnPayService;
    private final VnPayProperties vnPayProperties;

    @PostMapping("/vnpay/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createVnPayPayment(@Valid @RequestBody CreateVnPayPaymentRequest request,
                                                BindingResult bindingResult,
                                                HttpServletRequest servletRequest) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Dữ liệu không hợp lệ", bindingResult));
        }

        try {
            User user = getCurrentUser().orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Voucher voucher = null;
            if (request.getVoucherId() != null) {
                voucher = voucherRepository.findById(request.getVoucherId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
            }

            LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
            Order order = Order.builder()
                    .user(user)
                    .voucher(voucher)
                    .totalAmount(request.getAmount())
                    .orderDate(now)
                    .paymentMethod(PaymentMethod.VNPAY)
                    .status(OrderStatus.PENDING)
                    .orderInfo(buildOrderInfo(request))
                    .vnpTxnRef(generateTxnRef())
                    .paymentExpiredAt(now.plusMinutes(vnPayProperties.getExpireMinutes()))
                    .build();

            order = orderService.save(order);

            String paymentUrl = vnPayService.generatePaymentUrl(order, request.getAmount(), extractClientIp(servletRequest));

            Map<String, Object> data = new HashMap<>();
            data.put("paymentUrl", paymentUrl);
            data.put("orderId", order.getOrderId());
            data.put("txnRef", order.getVnpTxnRef());

            return ResponseEntity.ok(createSuccessResponse("Khởi tạo thanh toán thành công", data));
        } catch (RuntimeException ex) {
            log.error("Failed to create VNPay payment: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(ex.getMessage(), null));
        } catch (Exception ex) {
            log.error("Unexpected error while creating VNPay payment", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể khởi tạo thanh toán. Vui lòng thử lại.", null));
        }
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> handleVnPayIpn(HttpServletRequest request) {
        Map<String, String> params = extractParams(request);
        String receivedHash = params.get("vnp_SecureHash");

        if (!vnPayService.validateSignature(params, receivedHash)) {
            return ResponseEntity.ok(createIpnResponse("97", "Invalid signature"));
        }

        String txnRef = params.get("vnp_TxnRef");
        if (txnRef == null) {
            return ResponseEntity.ok(createIpnResponse("01", "Invalid order"));
        }

        Optional<Order> orderOpt = orderService.findByTxnRef(txnRef);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.ok(createIpnResponse("01", "Order not found"));
        }

        Order order = orderOpt.get();
        BigInteger amountFromVnPay = parseAmount(params.get("vnp_Amount"));
        BigInteger orderAmount = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .toBigInteger();

        if (!orderAmount.equals(amountFromVnPay)) {
            return ResponseEntity.ok(createIpnResponse("04", "Invalid amount"));
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionStatus = params.get("vnp_TransactionStatus");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        String payDateRaw = params.get("vnp_PayDate");

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            if (order.getStatus() != OrderStatus.PAID) {
                LocalDateTime payDate = parsePayDate(payDateRaw);
                orderService.markAsPaid(order, transactionNo, bankCode, responseCode, transactionStatus, payDate);
            }
            return ResponseEntity.ok(createIpnResponse("00", "Confirm Success"));
        } else {
            orderService.markAsFailed(order, responseCode, transactionStatus);
            return ResponseEntity.ok(createIpnResponse("00", "Confirm Success"));
        }
    }

    @GetMapping("/orders/{txnRef}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getOrderByTxnRef(@PathVariable String txnRef) {
        try {
            Order order = orderService.findByTxnRef(txnRef)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

            User currentUser = getCurrentUser()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            if (!order.getUser().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Bạn không có quyền xem đơn hàng này", null));
            }

            PaymentOrderResponseDTO dto = PaymentOrderResponseDTO.builder()
                    .orderId(order.getOrderId())
                    .txnRef(order.getVnpTxnRef())
                    .totalAmount(order.getTotalAmount())
                    .paymentMethod(order.getPaymentMethod())
                    .status(order.getStatus())
                    .responseCode(order.getVnpResponseCode())
                    .transactionNo(order.getVnpTransactionNo())
                    .bankCode(order.getVnpBankCode())
                    .orderDate(order.getOrderDate())
                    .payDate(order.getVnpPayDate())
                    .build();

            return ResponseEntity.ok(createSuccessResponse("Lấy thông tin đơn hàng thành công", dto));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(ex.getMessage(), null));
        }
    }

    @PostMapping("/fake/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> confirmFakePayment(@RequestBody Map<String, Object> body) {
        String txnRef = (String) body.get("txnRef");
        Boolean success = (Boolean) body.get("success");
        String bankCode = (String) body.getOrDefault("bankCode", "FAKEBANK");

        if (txnRef == null || success == null) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Thiếu thông tin giao dịch", null));
        }

        try {
            Order order = orderService.findByTxnRef(txnRef)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

            // Chỉ cho phép chủ đơn hàng thao tác
            User currentUser = getCurrentUser()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            if (!order.getUser().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Bạn không có quyền thao tác trên đơn hàng này", null));
            }

            if (success) {
                orderService.markAsPaid(
                        order,
                        "FAKE-" + System.currentTimeMillis(),
                        bankCode,
                        "00",
                        "00",
                        LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                );
            } else {
                orderService.markAsFailed(order, "99", "99");
            }

            return ResponseEntity.ok(createSuccessResponse("Cập nhật trạng thái thanh toán thành công", null));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(ex.getMessage(), null));
        }
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        if (bindingResult != null) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            response.put("errors", errors);
        }
        return response;
    }

    private Map<String, String> createIpnResponse(String code, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("RspCode", code);
        response.put("Message", message);
        return response;
    }

    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, value) -> {
            if (value != null && value.length > 0) {
                params.put(key, value[0]);
            }
        });
        return params;
    }

    private String extractClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    private BigInteger parseAmount(String amountRaw) {
        try {
            return new BigInteger(amountRaw);
        } catch (Exception e) {
            return BigInteger.ZERO;
        }
    }

    private LocalDateTime parsePayDate(String payDateRaw) {
        try {
            return LocalDateTime.parse(payDateRaw, DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        } catch (Exception e) {
            return LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        }
    }

    private String buildOrderInfo(CreateVnPayPaymentRequest request) {
        if (request.getOrderDescription() != null && !request.getOrderDescription().isBlank()) {
            return request.getOrderDescription();
        }
        return "Thanh toán đơn hàng tại Cinesmart";
    }

    private String generateTxnRef() {
        return String.valueOf(System.currentTimeMillis());
    }
}


