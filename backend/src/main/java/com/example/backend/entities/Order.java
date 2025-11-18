package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.entities.enums.OrderStatus;
import com.example.backend.entities.enums.PaymentMethod;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Ticket> tickets;

    private BigDecimal totalAmount;
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    @Column(length = 255)
    private String orderInfo;
    
    @Column(length = 32, unique = true)
    private String vnpTxnRef;
    
    @Column(length = 64)
    private String vnpTransactionNo;
    
    @Column(length = 50)
    private String vnpBankCode;
    
    @Column(length = 5)
    private String vnpResponseCode;
    
    @Column(length = 5)
    private String vnpTransactionStatus;
    
    private LocalDateTime vnpPayDate;
    private LocalDateTime paymentExpiredAt;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderCombo> orderCombos;
}
