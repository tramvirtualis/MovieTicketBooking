package com.example.backend.repositories;

import com.example.backend.entities.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    
    @Query("SELECT s FROM Showtime s " +
           "LEFT JOIN FETCH s.movieVersion mv " +
           "LEFT JOIN FETCH mv.movie m " +
           "LEFT JOIN FETCH s.cinemaRoom cr " +
           "WHERE cr.roomId = :roomId " +
           "ORDER BY s.startTime ASC")
    List<Showtime> findByCinemaRoom_RoomId(@Param("roomId") Long roomId);
    
    @Query("SELECT s FROM Showtime s " +
           "LEFT JOIN FETCH s.movieVersion mv " +
           "LEFT JOIN FETCH mv.movie m " +
           "LEFT JOIN FETCH s.cinemaRoom cr " +
           "LEFT JOIN FETCH s.tickets t " +
           "WHERE s.showtimeId = :showtimeId")
    Optional<Showtime> findByIdWithRelations(@Param("showtimeId") Long showtimeId);
    
    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.cinemaRoom.roomId = :roomId AND EXISTS (SELECT t FROM Ticket t WHERE t.showtime = s)")
    boolean existsByRoomIdWithTickets(@Param("roomId") Long roomId);
}

