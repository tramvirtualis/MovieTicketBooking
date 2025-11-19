package com.example.backend.repositories;

import com.example.backend.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserUserIdOrderByOrderDateDesc(Long userId);
    
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.tickets t " +
           "LEFT JOIN FETCH t.showtime s " +
           "LEFT JOIN FETCH s.movieVersion mv " +
           "LEFT JOIN FETCH mv.movie m " +
           "LEFT JOIN FETCH t.seat se " +
           "LEFT JOIN FETCH s.cinemaRoom cr " +
           "LEFT JOIN FETCH cr.cinemaComplex cc " +
           "LEFT JOIN FETCH cc.address a " +
           "WHERE o.user.userId = :userId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findByUserUserIdWithDetails(@Param("userId") Long userId);
}

