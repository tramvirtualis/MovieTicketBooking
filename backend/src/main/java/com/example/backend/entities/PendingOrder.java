package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String appTransId; // ZaloPay transaction ID
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private Long showtimeId;
    private String seatIds; // JSON array: ["A1", "B2", ...]
    private String foodComboData; // JSON array: [{"foodComboId": 1, "quantity": 2}, ...]
    private BigDecimal totalAmount;
    private String voucherCode;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        expiresAt = createdAt.plusHours(1); // Expire sau 1 giờ
    }
}

