package com.example.backend.repositories;

import com.example.backend.entities.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByCinemaRoom_RoomId(Long roomId);
    
    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.cinemaRoom.roomId = :roomId AND EXISTS (SELECT t FROM Ticket t WHERE t.showtime = s)")
    boolean existsByRoomIdWithTickets(@Param("roomId") Long roomId);
}

