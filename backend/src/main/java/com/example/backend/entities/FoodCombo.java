package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_combos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FoodCombo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_combo_id")
    private Long foodComboId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image")
    private String image;

    @OneToMany(mappedBy = "foodCombo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderCombo> orderCombos = new ArrayList<>();
}

