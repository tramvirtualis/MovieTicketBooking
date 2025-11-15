package com.example.backend.repositories;

import com.example.backend.entities.FoodCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodComboRepository extends JpaRepository<FoodCombo, Long> {
}

