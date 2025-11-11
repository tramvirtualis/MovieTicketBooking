package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "managers")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter
@Setter
@NoArgsConstructor
public class Manager extends User {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_complex_id")
    private CinemaComplex cinemaComplex;
}

