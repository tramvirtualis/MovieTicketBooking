package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_combos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCombo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderComboId;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @OneToOne
    @JoinColumn(name = "food_combo_id", referencedColumnName = "foodComboId")
    private FoodCombo foodCombo;

    private Integer quantity;
    private BigDecimal price;
}
