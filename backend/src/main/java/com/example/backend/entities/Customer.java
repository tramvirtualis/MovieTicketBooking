package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter
@Setter
@NoArgsConstructor
public class Customer extends User {
    @Column(name = "name")
    private String name;

    @Column(name = "dob")
    private LocalDate dob;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "customer_favorites",
        joinColumns = @JoinColumn(name = "customer_id"),
        inverseJoinColumns = @JoinColumn(name = "movie_id")
    )
    private List<Movie> favorites = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "customer_vouchers",
        joinColumns = @JoinColumn(name = "customer_id"),
        inverseJoinColumns = @JoinColumn(name = "voucher_id")
    )
    private List<Voucher> vouchers = new ArrayList<>();
}

