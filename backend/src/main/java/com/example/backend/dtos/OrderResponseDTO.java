package com.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    private Long orderId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private List<OrderItemDTO> items; // Tickets
    private List<OrderComboDTO> combos; // Food & drinks
    private String voucherCode; // If voucher was used
    // User info for admin
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    
    // CinemaComplexId cho đơn hàng chỉ có đồ ăn (food-only orders)
    private Long cinemaComplexId;
}

