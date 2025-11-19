package com.example.backend.controllers;

import com.example.backend.config.MomoProperties;
import com.example.backend.dtos.CreatePaymentRequest;
import com.example.backend.dtos.PaymentOrderResponseDTO;
import com.example.backend.dtos.MomoCreatePaymentResponse;
import com.example.backend.entities.Order;
import com.example.backend.entities.User;
import com.example.backend.entities.Voucher;
import com.example.backend.entities.enums.OrderStatus;
import com.example.backend.entities.enums.PaymentMethod;
import com.example.backend.repositories.UserRepository;
import com.example.backend.repositories.VoucherRepository;
import com.example.backend.services.OrderService;
import com.example.backend.services.MomoService;
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

import java.math.RoundingMode;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        allowCredentials = "true")
public class PaymentController {

    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final OrderService orderService;
    private final MomoService momoService;
    private final MomoProperties momoProperties;

    @PostMapping("/momo/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createMomoPayment(@Valid @RequestBody CreatePaymentRequest request,
                                               BindingResult bindingResult) {
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
                    .paymentMethod(PaymentMethod.MOMO)
                    .status(OrderStatus.PENDING)
                    .orderInfo(buildOrderInfo(request))
                    .vnpTxnRef(generateTxnRef())
                    .paymentExpiredAt(now.plusMinutes(15))
                    .build();

            order = orderService.save(order);

            String requestId = UUID.randomUUID().toString();
            MomoCreatePaymentResponse momoResponse = momoService.createPayment(
                    order.getVnpTxnRef(),
                    requestId,
                    request.getAmount(),
                    order.getOrderInfo()
            );
            if (momoResponse == null || momoResponse.getPayUrl() == null) {
                throw new IllegalStateException("MoMo không trả về liên kết thanh toán");
            }

            Map<String, Object> data = new HashMap<>();
            data.put("paymentUrl", momoResponse.getPayUrl());
            data.put("orderId", order.getOrderId());
            data.put("txnRef", order.getVnpTxnRef());

            return ResponseEntity.ok(createSuccessResponse("Khởi tạo thanh toán thành công", data));
        } catch (RuntimeException ex) {
            log.error("Failed to create MoMo payment: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(ex.getMessage(), null));
        } catch (Exception ex) {
            log.error("Unexpected error while creating MoMo payment", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Không thể khởi tạo thanh toán. Vui lòng thử lại.", null));
        }
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Map<String, Object>> handleMomoIpn(@RequestBody Map<String, Object> body) {
        Map<String, String> params = body.entrySet()
                .stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> String.valueOf(e.getValue())));

        if (!momoService.validateIpnSignature(params)) {
            return ResponseEntity.ok(createMomoIpnResponse(1, "Invalid signature"));
        }

        String orderId = params.get("orderId");
        if (orderId == null) {
            return ResponseEntity.ok(createMomoIpnResponse(2, "Missing orderId"));
        }

        Optional<Order> orderOpt = orderService.findByTxnRef(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.ok(createMomoIpnResponse(3, "Order not found"));
        }

        Order order = orderOpt.get();
        String amountParam = params.get("amount");
        String expectedAmount = order.getTotalAmount()
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString();
        if (!expectedAmount.equals(amountParam)) {
            return ResponseEntity.ok(createMomoIpnResponse(4, "Invalid amount"));
        }

        String resultCode = params.get("resultCode");
        String message = params.getOrDefault("message", "");
        String transId = params.getOrDefault("transId", "");
        String payType = params.getOrDefault("payType", "MOMO");

        if ("0".equals(resultCode)) {
            if (order.getStatus() != OrderStatus.PAID) {
                orderService.markAsPaid(
                        order,
                        transId,
                        payType,
                        resultCode,
                        message,
                        LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                );
            }
            return ResponseEntity.ok(createMomoIpnResponse(0, "Confirm Success"));
        } else {
            orderService.markAsFailed(order, resultCode, message);
            return ResponseEntity.ok(createMomoIpnResponse(0, "Confirm Success"));
        }
    }

    @GetMapping("/momo/ipn")
    public void handleMomoRedirect(@RequestParam Map<String, String> params,
                                   HttpServletResponse response) throws IOException {
        String orderId = params.getOrDefault("orderId", "");
        String redirectUrl = momoProperties.getReturnPageUrl();
        if (orderId != null && !orderId.isEmpty()) {
            String separator = redirectUrl.contains("?") ? "&" : "?";
            redirectUrl = redirectUrl + separator + "orderId=" + URLEncoder.encode(orderId, StandardCharsets.UTF_8);
        }
        response.sendRedirect(redirectUrl);
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

    private Map<String, Object> createMomoIpnResponse(int code, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("resultCode", code);
        response.put("message", message);
        return response;
    }

    private Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    private String buildOrderInfo(CreatePaymentRequest request) {
        if (request.getOrderDescription() != null && !request.getOrderDescription().isBlank()) {
            return request.getOrderDescription();
        }
        return "Thanh toán đơn hàng tại Cinesmart";
    }

    private String generateTxnRef() {
        return String.valueOf(System.currentTimeMillis());
    }
}


