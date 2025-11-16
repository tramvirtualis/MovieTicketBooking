package com.example.backend.repositories;

import com.example.backend.entities.CinemaComplex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CinemaComplexRepository extends JpaRepository<CinemaComplex, Long> {
    Optional<CinemaComplex> findByComplexId(Long complexId);
}