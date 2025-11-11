package com.example.backend.entities;

import com.example.backend.entities.enums.RoomType;
import com.example.backend.entities.enums.SeatType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "prices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"room_type", "seat_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Price {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private Long priceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}

