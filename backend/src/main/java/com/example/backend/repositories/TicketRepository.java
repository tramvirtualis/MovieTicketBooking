package com.example.backend.repositories;

import com.example.backend.entities.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    @Query("SELECT COUNT(t) > 0 FROM Ticket t WHERE t.showtime.cinemaRoom.roomId = :roomId")
    boolean existsByRoomId(@Param("roomId") Long roomId);
    
    @Query("SELECT t FROM Ticket t WHERE t.showtime.cinemaRoom.roomId = :roomId")
    List<Ticket> findByRoomId(@Param("roomId") Long roomId);
}

