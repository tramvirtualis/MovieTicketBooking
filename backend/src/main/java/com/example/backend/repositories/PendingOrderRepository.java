package com.example.backend.repositories;

import com.example.backend.entities.PendingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PendingOrderRepository extends JpaRepository<PendingOrder, Long> {
    Optional<PendingOrder> findByAppTransId(String appTransId);
    void deleteByAppTransId(String appTransId);
}

