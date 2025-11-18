package com.example.backend.dtos;

import com.example.backend.entities.enums.OrderStatus;
import com.example.backend.entities.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentOrderResponseDTO {
    private Long orderId;
    private String txnRef;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private OrderStatus status;
    private String responseCode;
    private String transactionNo;
    private String bankCode;
    private LocalDateTime orderDate;
    private LocalDateTime payDate;
}


