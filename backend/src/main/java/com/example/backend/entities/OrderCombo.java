package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_combos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderCombo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_combo_id")
    private Long orderComboId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_combo_id", nullable = false)
    private FoodCombo foodCombo;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}

