package com.example.backend.repositories;

import com.example.backend.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Methods from HEAD (for getting orders)
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
    
    // Get all orders for admin
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.tickets t " +
           "LEFT JOIN FETCH t.showtime s " +
           "LEFT JOIN FETCH s.movieVersion mv " +
           "LEFT JOIN FETCH mv.movie m " +
           "LEFT JOIN FETCH t.seat se " +
           "LEFT JOIN FETCH s.cinemaRoom cr " +
           "LEFT JOIN FETCH cr.cinemaComplex cc " +
           "LEFT JOIN FETCH cc.address a " +
           "LEFT JOIN FETCH o.user u " +
           "ORDER BY o.orderDate DESC")
    List<Order> findAllWithDetails();
    
    // Get orders by cinema complex ID for manager
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.tickets t " +
           "LEFT JOIN FETCH t.showtime s " +
           "LEFT JOIN FETCH s.movieVersion mv " +
           "LEFT JOIN FETCH mv.movie m " +
           "LEFT JOIN FETCH t.seat se " +
           "LEFT JOIN FETCH s.cinemaRoom cr " +
           "LEFT JOIN FETCH cr.cinemaComplex cc " +
           "LEFT JOIN FETCH cc.address a " +
           "LEFT JOIN FETCH o.user u " +
           "WHERE cc.complexId = :complexId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findByCinemaComplexIdWithDetails(@Param("complexId") Long complexId);
    
    // Methods from origin/nhan (for MoMo payment)
    Optional<Order> findByVnpTxnRef(String vnpTxnRef);
    
    // Check if voucher has been used by user in any order
    @Query("SELECT COUNT(o) > 0 FROM Order o WHERE o.user.userId = :userId AND o.voucher.voucherId = :voucherId")
    boolean existsByUserUserIdAndVoucherVoucherId(@Param("userId") Long userId, @Param("voucherId") Long voucherId);
}
