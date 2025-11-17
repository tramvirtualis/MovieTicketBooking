package com.example.backend.repositories;

import com.example.backend.entities.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query("""
        SELECT DISTINCT s FROM Showtime s
        LEFT JOIN FETCH s.movieVersion mv
        LEFT JOIN FETCH mv.movie m
        LEFT JOIN FETCH s.cinemaRoom cr
        LEFT JOIN FETCH cr.cinemaComplex cc
        LEFT JOIN FETCH cc.address addr
        WHERE (:startTime IS NULL OR s.startTime >= :startTime)
        AND (:endTime IS NULL OR s.startTime < :endTime)
        AND (:movieId IS NULL OR m.movieId = :movieId)
        AND (:cinemaId IS NULL OR cc.complexId = :cinemaId)
        ORDER BY m.title ASC, cc.name ASC, s.startTime ASC
    """)
    List<Showtime> findScheduleShowtimes(@Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime,
                                         @Param("movieId") Long movieId,
                                         @Param("cinemaId") Long cinemaId);
}

