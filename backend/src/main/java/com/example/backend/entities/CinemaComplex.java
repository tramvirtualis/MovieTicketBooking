package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CinemaComplex {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complexId;

    private String name;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id", referencedColumnName = "addressId")
    private Address address;

    @OneToMany(mappedBy = "cinemaComplex", cascade = CascadeType.ALL)
    private List<CinemaRoom> rooms;
}
