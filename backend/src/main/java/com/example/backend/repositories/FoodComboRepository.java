package com.example.backend.repositories;

import com.example.backend.entities.FoodCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodComboRepository extends JpaRepository<FoodCombo, Long> {
    
    @Query(value = "SELECT fc.* FROM food_combos fc " +
           "INNER JOIN complex_food_combo cfc ON fc.food_combo_id = cfc.food_combo_id " +
           "WHERE cfc.complex_id = :complexId", nativeQuery = true)
    List<FoodCombo> findByCinemaComplexId(@Param("complexId") Long complexId);
}

