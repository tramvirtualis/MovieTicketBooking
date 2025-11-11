package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    protected Long userId;

    @Column(name = "username", nullable = false, unique = true)
    protected String username;

    @Column(name = "password", nullable = false)
    protected String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    protected Address address;

    @Column(name = "email", nullable = false, unique = true)
    protected String email;

    @Column(name = "phone")
    protected String phone;

    @Column(name = "status", nullable = false)
    protected Boolean status = true;
}

