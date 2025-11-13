package com.example.backend.repositories;

import com.example.backend.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    Optional<Customer> findByUsername(String username);
    
    Optional<Customer> findByEmail(String email);
}