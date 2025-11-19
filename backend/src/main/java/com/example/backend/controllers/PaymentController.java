package com.example.backend.controllers;

import com.example.backend.entities.Order;
import com.example.backend.entities.PendingOrder;
import com.example.backend.entities.User;
import com.example.backend.entities.enums.PaymentMethod;
import com.example.backend.repositories.PendingOrderRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.OrderCreationService;
import com.example.backend.services.ZaloPayService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        allowCredentials = "true")
public class PaymentController {

    private final ZaloPayService zaloPayService;
    private final PendingOrderRepository pendingOrderRepository;
    private final UserRepository userRepository;
    private final OrderCreationService orderCreationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Tạo payment URL cho ZaloPay
     */
    @PostMapping("/zalopay/create")
    public ResponseEntity<?> createZaloPayOrder(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== ZaloPay Create Order Request ===");
            System.out.println("Request body: " + request);
            
            // Xử lý amount - có thể là Integer, Long, Double, hoặc String
            Object amountObj = request.get("amount");
            Long amount;
            if (amountObj instanceof Number) {
                amount = ((Number) amountObj).longValue();
            } else if (amountObj instanceof String) {
                // Nếu là string, parse và làm tròn
                double amountDouble = Double.parseDouble((String) amountObj);
                amount = Math.round(amountDouble);
            } else {
                throw new IllegalArgumentException("Amount phải là số");
            }
            
            System.out.println("Parsed amount: " + amount);
            
            String description = request.get("description") != null ? 
                request.get("description").toString() : "Thanh toán vé xem phim";
            String orderId = request.get("orderId") != null ? 
                request.get("orderId").toString() : String.valueOf(System.currentTimeMillis());

            System.out.println("Description: " + description);
            System.out.println("OrderId: " + orderId);

            // Lấy booking info từ request
            Map<String, Object> bookingInfo = (Map<String, Object>) request.get("bookingInfo");
            
            Map<String, Object> result = zaloPayService.createPaymentOrder(amount, description, orderId);
            
            System.out.println("ZaloPay Service Result: " + result);

            if (result != null && result.get("order_url") != null) {
                String appTransId = (String) result.get("app_trans_id");
                
                // Lưu booking info vào PendingOrder
                if (bookingInfo != null) {
                    try {
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        String username = authentication.getName();
                        Optional<User> userOpt = userRepository.findByUsername(username);
                        
                        if (userOpt.isPresent()) {
                            User user = userOpt.get();
                            
                            // Parse booking info
                            Long showtimeId = bookingInfo.get("showtimeId") != null ? 
                                Long.parseLong(bookingInfo.get("showtimeId").toString()) : null;
                            List<String> seatIds = bookingInfo.get("seatIds") != null ?
                                (List<String>) bookingInfo.get("seatIds") : List.of();
                            List<Map<String, Object>> foodCombos = bookingInfo.get("foodCombos") != null ?
                                (List<Map<String, Object>>) bookingInfo.get("foodCombos") : List.of();
                            String voucherCode = bookingInfo.get("voucherCode") != null ?
                                bookingInfo.get("voucherCode").toString() : null;
                            
                            // Lưu vào PendingOrder
                            PendingOrder pendingOrder = PendingOrder.builder()
                                    .appTransId(appTransId)
                                    .user(user)
                                    .showtimeId(showtimeId)
                                    .seatIds(objectMapper.writeValueAsString(seatIds))
                                    .foodComboData(objectMapper.writeValueAsString(foodCombos))
                                    .totalAmount(BigDecimal.valueOf(amount))
                                    .voucherCode(voucherCode)
                                    .build();
                            
                            pendingOrderRepository.save(pendingOrder);
                            System.out.println("Saved pending order for appTransId: " + appTransId);
                        }
                    } catch (Exception e) {
                        System.err.println("Error saving pending order: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                Map<String, Object> data = new HashMap<>();
                data.put("payment_url", result.get("order_url"));
                data.put("app_trans_id", appTransId);
                data.put("zp_trans_token", result.get("zp_trans_token"));
                data.put("qr_code", result.get("qr_code"));
                response.put("data", data);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                String errorMessage = "Không thể tạo đơn hàng thanh toán";
                
                if (result != null) {
                    // Lấy thông tin lỗi chi tiết từ ZaloPay
                    Object returnMsg = result.get("return_message");
                    Object subReturnMsg = result.get("sub_return_message");
                    
                    if (subReturnMsg != null && !subReturnMsg.toString().isEmpty()) {
                        errorMessage = subReturnMsg.toString();
                    } else if (returnMsg != null && !returnMsg.toString().isEmpty()) {
                        errorMessage = returnMsg.toString();
                    }
                    
                    // Thêm thông tin debug vào response
                    response.put("return_code", result.get("return_code"));
                    response.put("sub_return_code", result.get("sub_return_code"));
                }
                
                response.put("success", false);
                response.put("message", errorMessage);
                response.put("error", errorMessage);
                System.err.println("ZaloPay create order failed: " + errorMessage);
                System.err.println("Full result: " + result);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in createZaloPayOrder: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Tạo order từ pending order khi user redirect về success page
     * Endpoint này được gọi từ frontend khi user quay lại từ ZaloPay
     */
    @PostMapping("/zalopay/complete")
    public ResponseEntity<?> completeZaloPayOrder(@RequestParam String appTransId) {
        try {
            System.out.println("=== Complete ZaloPay Order ===");
            System.out.println("AppTransId: " + appTransId);
            
            Optional<PendingOrder> pendingOrderOpt = pendingOrderRepository.findByAppTransId(appTransId);
            
            if (pendingOrderOpt.isEmpty()) {
                System.err.println("Pending order not found for appTransId: " + appTransId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy đơn hàng");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            PendingOrder pendingOrder = pendingOrderOpt.get();
            
            // Parse seat IDs
            List<String> seatIds = List.of();
            if (pendingOrder.getSeatIds() != null && !pendingOrder.getSeatIds().isEmpty()) {
                try {
                    seatIds = objectMapper.readValue(
                        pendingOrder.getSeatIds(), 
                        new TypeReference<List<String>>() {}
                    );
                } catch (Exception e) {
                    System.err.println("Error parsing seatIds: " + e.getMessage());
                }
            }
            
            // Parse food combos
            List<Map<String, Object>> foodComboMaps = List.of();
            if (pendingOrder.getFoodComboData() != null && !pendingOrder.getFoodComboData().isEmpty()) {
                try {
                    foodComboMaps = objectMapper.readValue(
                        pendingOrder.getFoodComboData(),
                        new TypeReference<List<Map<String, Object>>>() {}
                    );
                } catch (Exception e) {
                    System.err.println("Error parsing foodComboData: " + e.getMessage());
                }
            }
            
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
            
            // Tạo order
            Long showtimeId = pendingOrder.getShowtimeId();
            if (showtimeId == null || seatIds == null || seatIds.isEmpty()) {
                // Chỉ có đồ ăn, không có vé phim
                showtimeId = null;
                seatIds = List.of();
            }
            
            System.out.println("Creating order with:");
            System.out.println("  - UserId: " + pendingOrder.getUser().getUserId());
            System.out.println("  - ShowtimeId: " + showtimeId);
            System.out.println("  - SeatIds: " + seatIds);
            System.out.println("  - FoodCombos: " + foodComboRequests.size());
            System.out.println("  - TotalAmount: " + pendingOrder.getTotalAmount());
            
            Order order = orderCreationService.createOrder(
                pendingOrder.getUser().getUserId(),
                showtimeId,
                seatIds,
                foodComboRequests,
                pendingOrder.getTotalAmount(),
                PaymentMethod.ZALOPAY,
                pendingOrder.getVoucherCode()
            );
            
            // Xóa pending order
            pendingOrderRepository.delete(pendingOrder);
            
            System.out.println("Order created successfully! OrderId: " + order.getOrderId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", order.getOrderId());
            response.put("message", "Đơn hàng đã được tạo thành công");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error completing ZaloPay order: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi tạo đơn hàng: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Callback từ ZaloPay sau khi thanh toán
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
                // Parse data để lấy app_trans_id
                String appTransId = null;
                try {
                    Map<String, Object> dataMap = objectMapper.readValue(data, new TypeReference<Map<String, Object>>() {});
                    appTransId = (String) dataMap.get("app_trans_id");
                } catch (Exception e) {
                    System.err.println("Error parsing callback data: " + e.getMessage());
                }
                
                // Tạo order từ pending order (nếu chưa tạo)
                if (appTransId != null) {
                    try {
                        Optional<PendingOrder> pendingOrderOpt = pendingOrderRepository.findByAppTransId(appTransId);
                        if (pendingOrderOpt.isPresent()) {
                            // Order đã được tạo từ /complete endpoint, chỉ cần xóa pending order
                            pendingOrderRepository.delete(pendingOrderOpt.get());
                            System.out.println("Pending order deleted after callback for appTransId: " + appTransId);
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing callback: " + e.getMessage());
                        e.printStackTrace();
                    }
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
     * Kiểm tra trạng thái thanh toán
     */
    @GetMapping("/zalopay/status/{appTransId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String appTransId) {
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
}
