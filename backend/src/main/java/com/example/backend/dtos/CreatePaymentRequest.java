package com.example.backend.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền tối thiểu là 1.000đ")
    private BigDecimal amount;

    private Long voucherId;

    @Size(max = 255, message = "Mô tả đơn hàng tối đa 255 ký tự")
    private String orderDescription;
}



