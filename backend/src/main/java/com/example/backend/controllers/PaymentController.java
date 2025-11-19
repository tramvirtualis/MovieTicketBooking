package com.example.backend.controllers;

import com.example.backend.config.MomoProperties;
import com.example.backend.dtos.CreatePaymentRequest;
import com.example.backend.dtos.PaymentOrderResponseDTO;
import com.example.backend.dtos.MomoCreatePaymentResponse;
import com.example.backend.entities.Order;
import com.example.backend.entities.User;
import com.example.backend.entities.Voucher;
import com.example.backend.entities.enums.PaymentMethod;
import com.example.backend.repositories.UserRepository;
import com.example.backend.repositories.VoucherRepository;
import com.example.backend.services.OrderCreationService;
import com.example.backend.services.OrderService;
import com.example.backend.services.MomoService;
import com.example.backend.services.ZaloPayService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.math.RoundingMode;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        allowCredentials = "true")
public class PaymentController {

    // ZaloPay dependencies
    private final ZaloPayService zaloPayService;
    private final OrderCreationService orderCreationService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // MoMo dependencies
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final OrderService orderService;
    private final MomoService momoService;
    private final MomoProperties momoProperties;

    // ==================== ZaloPay Endpoints ====================

    /**
     * Tạo payment URL cho ZaloPay và tạo Order trực tiếp (giống MoMo)
     */
    @PostMapping("/zalopay/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createZaloPayOrder(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== ZaloPay Create Order Request ===");
            System.out.println("Request body: " + request);
            
            // Lấy user hiện tại
            User user = getCurrentUser().orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            // Xử lý amount - có thể là Integer, Long, Double, hoặc String
            Object amountObj = request.get("amount");
            BigDecimal totalAmount;
            if (amountObj instanceof Number) {
                totalAmount = BigDecimal.valueOf(((Number) amountObj).doubleValue());
            } else if (amountObj instanceof String) {
                totalAmount = new BigDecimal((String) amountObj);
            } else {
                throw new IllegalArgumentException("Amount phải là số");
            }
            
            System.out.println("Parsed amount: " + totalAmount);
            
            String description = request.get("description") != null ? 
                request.get("description").toString() : "Thanh toán vé xem phim";
            
            // Lấy booking info từ request
            Map<String, Object> bookingInfo = (Map<String, Object>) request.get("bookingInfo");
            
            // Parse booking info
            Long showtimeId = null;
            List<String> seatIds = List.of();
            List<Map<String, Object>> foodComboMaps = List.of();
            String voucherCode = null;
            Voucher voucher = null;
            
            if (bookingInfo != null) {
                showtimeId = bookingInfo.get("showtimeId") != null ? 
                    Long.parseLong(bookingInfo.get("showtimeId").toString()) : null;
                seatIds = bookingInfo.get("seatIds") != null ?
                    (List<String>) bookingInfo.get("seatIds") : List.of();
                foodComboMaps = bookingInfo.get("foodCombos") != null ?
                    (List<Map<String, Object>>) bookingInfo.get("foodCombos") : List.of();
                voucherCode = bookingInfo.get("voucherCode") != null ?
                    bookingInfo.get("voucherCode").toString() : null;
                
                // Lấy voucher nếu có
                if (voucherCode != null && !voucherCode.isEmpty()) {
                    voucher = voucherRepository.findByCode(voucherCode).orElse(null);
                }
            }
            
            // Tạo Order trực tiếp (giống MoMo)
            LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
            String txnRef = String.valueOf(System.currentTimeMillis());
            
            // Tạo Order với tickets và orderCombos
            List<OrderCreationService.FoodComboRequest> foodComboRequests = foodComboMaps.stream()
                .map(map -> {
                    try {
                        return new OrderCreationService.FoodComboRequest(
                            Long.parseLong(map.get("foodComboId").toString()),
                            Integer.parseInt(map.get("quantity").toString())
                        );
                    } catch (Exception e) {
                        System.err.println("Error parsing foodCombo: " + e.getMessage());
                        return null;
                    }
                })
                .filter(req -> req != null)
                .toList();
            
            // Tạo Order trực tiếp
            Order order = orderCreationService.createOrder(
                user.getUserId(),
                showtimeId,
                seatIds,
                foodComboRequests,
                totalAmount,
                PaymentMethod.ZALOPAY,
                voucherCode
            );
            
            // Set thêm thông tin cho ZaloPay
            order.setVnpTxnRef(txnRef);
            order.setOrderInfo(description);
            order.setPaymentExpiredAt(now.plusMinutes(15));
            order = orderService.save(order);
            
            System.out.println("Created Order ID: " + order.getOrderId() + ", TxnRef: " + txnRef);
            
            // Tạo ZaloPay payment order
            Map<String, Object> result = zaloPayService.createPaymentOrder(
                totalAmount.longValue(), 
                description, 
                txnRef
            );
            
            System.out.println("ZaloPay Service Result: " + result);

            if (result != null && result.get("order_url") != null) {
                String appTransId = (String) result.get("app_trans_id");
                
                // Cập nhật vnpTxnRef với appTransId từ ZaloPay
                order.setVnpTxnRef(appTransId);
                orderService.save(order);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                Map<String, Object> data = new HashMap<>();
                data.put("payment_url", result.get("order_url"));
                data.put("app_trans_id", appTransId);
                data.put("orderId", order.getOrderId());
                data.put("txnRef", appTransId);
                data.put("zp_trans_token", result.get("zp_trans_token"));
                data.put("qr_code", result.get("qr_code"));
                response.put("data", data);
                return ResponseEntity.ok(response);
            } else {
                // Xóa Order nếu không tạo được payment URL
                orderService.delete(order);
                
                Map<String, Object> response = new HashMap<>();
                String errorMessage = "Không thể tạo đơn hàng thanh toán";
                
                if (result != null) {
                    Object returnMsg = result.get("return_message");
                    Object subReturnMsg = result.get("sub_return_message");
                    
                    if (subReturnMsg != null && !subReturnMsg.toString().isEmpty()) {
                        errorMessage = subReturnMsg.toString();
                    } else if (returnMsg != null && !returnMsg.toString().isEmpty()) {
                        errorMessage = returnMsg.toString();
                    }
                    
                    response.put("return_code", result.get("return_code"));
                    response.put("sub_return_code", result.get("sub_return_code"));
                }
                
                response.put("success", false);
                response.put("message", errorMessage);
                response.put("error", errorMessage);
                System.err.println("ZaloPay create order failed: " + errorMessage);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in createZaloPayOrder: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    /**
     * Callback từ ZaloPay sau khi thanh toán - chỉ cập nhật transaction info
     */
    @PostMapping("/zalopay/callback")
    public ResponseEntity<?> zaloPayCallback(@RequestBody Map<String, Object> callbackData) {
        try {
            System.out.println("=== ZaloPay Callback ===");
            System.out.println("Callback data: " + callbackData);
            
            // Xác thực callback
            String data = callbackData.get("data") != null ? 
                callbackData.get("data").toString() : "";
            String mac = callbackData.get("mac") != null ? 
                callbackData.get("mac").toString() : "";

            boolean isValid = zaloPayService.verifyCallback(data, mac);

            if (isValid) {
                // Parse data để lấy app_trans_id và transaction info
                String appTransId = null;
                try {
                    Map<String, Object> dataMap = objectMapper.readValue(data, new TypeReference<Map<String, Object>>() {});
                    appTransId = (String) dataMap.get("app_trans_id");
                    
                    // Cập nhật transaction info cho Order nếu tìm thấy
                    if (appTransId != null) {
                        Optional<Order> orderOpt = orderService.findByTxnRef(appTransId);
                        if (orderOpt.isPresent()) {
                            Order order = orderOpt.get();
                            // Cập nhật transaction info từ callback
                            Object zpTransToken = dataMap.get("zp_trans_token");
                            if (zpTransToken != null) {
                                order.setVnpTransactionNo(zpTransToken.toString());
                            }
                            order.setVnpPayDate(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                            orderService.save(order);
                            System.out.println("Updated transaction info for Order ID: " + order.getOrderId());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing callback data: " + e.getMessage());
                }
                
                // Trả về response cho ZaloPay
                Map<String, Object> response = new HashMap<>();
                response.put("return_code", 1);
                response.put("return_message", "success");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("return_code", -1);
                response.put("return_message", "Invalid mac");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("return_code", -1);
            response.put("return_message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Kiểm tra trạng thái thanh toán ZaloPay
     */
    @GetMapping("/zalopay/status/{appTransId}")
    public ResponseEntity<?> checkZaloPayStatus(@PathVariable String appTransId) {
        try {
            // TODO: Implement query order status from ZaloPay
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", "pending");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== MoMo Endpoints ====================

    @PostMapping("/momo/create")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createMomoPayment(@Valid @RequestBody CreatePaymentRequest request,
                                               BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Dữ liệu không hợp lệ", bindingResult));
        }

        try {
            User user = getCurrentUser().orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            // Parse booking info
            Long showtimeId = request.getShowtimeId();
            List<String> seatIds = request.getSeatIds() != null ? request.getSeatIds() : List.of();
            List<Map<String, Object>> foodComboMaps = request.getFoodCombos() != null ? request.getFoodCombos() : List.of();
            String voucherCode = request.getVoucherCode();
            
            // Lấy voucher nếu có
            Voucher voucher = null;
            if (request.getVoucherId() != null) {
                voucher = voucherRepository.findById(request.getVoucherId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
            } else if (voucherCode != null && !voucherCode.isEmpty()) {
                voucher = voucherRepository.findByCode(voucherCode).orElse(null);
            }

            // Tạo Order với tickets và orderCombos (giống ZaloPay)
            List<OrderCreationService.FoodComboRequest> foodComboRequests = foodComboMaps.stream()
                .map(map -> {
                    try {
                        return new OrderCreationService.FoodComboRequest(
                            Long.parseLong(map.get("foodComboId").toString()),
                            Integer.parseInt(map.get("quantity").toString())
                        );
                    } catch (Exception e) {
                        System.err.println("Error parsing foodCombo: " + e.getMessage());
                        return null;
                    }
                })
                .filter(req -> req != null)
                .toList();
            
            // Tạo Order trực tiếp với tickets và orderCombos
            Order order = orderCreationService.createOrder(
                user.getUserId(),
                showtimeId,
                seatIds,
                foodComboRequests,
                request.getAmount(),
                PaymentMethod.MOMO,
                voucherCode
            );
            
            // Set thêm thông tin cho MoMo
            LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
            String txnRef = generateTxnRef();
            order.setVnpTxnRef(txnRef);
            order.setOrderInfo(buildOrderInfo(request));
            order.setPaymentExpiredAt(now.plusMinutes(15));
            order = orderService.save(order);

            String requestId = UUID.randomUUID().toString();
            MomoCreatePaymentResponse momoResponse = momoService.createPayment(
                    order.getVnpTxnRef(),
                    requestId,
                    request.getAmount(),
                    order.getOrderInfo()
            );
            if (momoResponse == null || momoResponse.getPayUrl() == null) {
                // Xóa Order nếu không tạo được payment URL
                orderService.delete(order);
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

        // Chỉ cập nhật transaction info, không set status (vì chỉ lưu đơn thành công)
        if ("0".equals(resultCode)) {
            // Thanh toán thành công - cập nhật transaction info
            order.setVnpTransactionNo(transId);
            order.setVnpBankCode(payType);
            order.setVnpResponseCode(resultCode);
            order.setVnpTransactionStatus(message);
            order.setVnpPayDate(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
            orderService.save(order);
            return ResponseEntity.ok(createMomoIpnResponse(0, "Confirm Success"));
        } else {
            // Thanh toán thất bại - xóa Order vì chỉ lưu đơn thành công
            orderService.delete(order);
            return ResponseEntity.ok(createMomoIpnResponse(0, "Confirm Success"));
        }
    }

    @GetMapping("/momo/ipn")
    public void handleMomoRedirect(@RequestParam Map<String, String> params,
                                   HttpServletResponse response) throws IOException {
        String orderId = params.getOrDefault("orderId", "");
        String resultCode = params.getOrDefault("resultCode", "");
        String amount = params.getOrDefault("amount", "");
        
        // Redirect về /payment/success với các params cần thiết
        String redirectUrl = "http://localhost:5173/payment/success";
        StringBuilder queryParams = new StringBuilder();
        
        if (orderId != null && !orderId.isEmpty()) {
            queryParams.append("orderId=").append(URLEncoder.encode(orderId, StandardCharsets.UTF_8));
        }
        if (resultCode != null && !resultCode.isEmpty()) {
            if (queryParams.length() > 0) queryParams.append("&");
            queryParams.append("resultCode=").append(URLEncoder.encode(resultCode, StandardCharsets.UTF_8));
        }
        if (amount != null && !amount.isEmpty()) {
            if (queryParams.length() > 0) queryParams.append("&");
            queryParams.append("amount=").append(URLEncoder.encode(amount, StandardCharsets.UTF_8));
        }
        
        if (queryParams.length() > 0) {
            redirectUrl = redirectUrl + "?" + queryParams.toString();
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

            PaymentOrderResponseDTO dto = new PaymentOrderResponseDTO(
                    order.getOrderId(),
                    order.getVnpTxnRef(),
                    order.getTotalAmount(),
                    order.getPaymentMethod(),
                    order.getVnpResponseCode(),
                    order.getVnpTransactionNo(),
                    order.getVnpBankCode(),
                    order.getOrderDate(),
                    order.getVnpPayDate()
            );

            return ResponseEntity.ok(createSuccessResponse("Lấy thông tin đơn hàng thành công", dto));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(ex.getMessage(), null));
        }
    }

    // ==================== Helper Methods ====================

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
