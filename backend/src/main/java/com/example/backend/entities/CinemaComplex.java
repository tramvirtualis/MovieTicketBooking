package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cinema_complexes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CinemaComplex {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complex_id")
    private Long complexId;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToMany(mappedBy = "cinemaComplex", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CinemaRoom> rooms = new ArrayList<>();

    @OneToMany(mappedBy = "cinemaComplex", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Manager> managers = new ArrayList<>();
}

