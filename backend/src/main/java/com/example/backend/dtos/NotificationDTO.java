package com.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String type; // REVIEW_SUCCESS, VOUCHER_ADDED, VOUCHER_SAVED, ORDER_SUCCESS
    private String title;
    private String message;
    private LocalDateTime timestamp;
    private Object data; // Optional additional data
}


