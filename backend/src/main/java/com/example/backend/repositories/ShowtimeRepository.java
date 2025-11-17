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
    
    /**
     * Lấy showtimes theo movieId, province và date (public API)
     * Query trực tiếp qua MovieVersion để đảm bảo lấy được đúng
     */
    @Query("SELECT s FROM Showtime s " +
           "JOIN FETCH s.movieVersion mv " +
           "JOIN FETCH mv.movie m " +
           "JOIN FETCH s.cinemaRoom cr " +
           "JOIN FETCH cr.cinemaComplex cc " +
           "JOIN FETCH cc.address a " +
           "WHERE mv.movie.movieId = :movieId " +
           "AND (:province IS NULL OR a.province = :province) " +
           "AND s.startTime >= :startOfDay " +
           "AND s.startTime < :endOfDay " +
           "AND s.startTime >= CURRENT_TIMESTAMP " +
           "ORDER BY cc.name ASC, s.startTime ASC")
    List<Showtime> findPublicShowtimes(@Param("movieId") Long movieId, 
                                       @Param("province") String province,
                                       @Param("startOfDay") java.time.LocalDateTime startOfDay,
                                       @Param("endOfDay") java.time.LocalDateTime endOfDay);
    
    /**
     * Lấy tất cả showtimes theo movieId và date (không filter province)
     * Query trực tiếp qua MovieVersion để đảm bảo lấy được đúng
     */
    @Query("SELECT s FROM Showtime s " +
           "JOIN FETCH s.movieVersion mv " +
           "JOIN FETCH mv.movie m " +
           "JOIN FETCH s.cinemaRoom cr " +
           "JOIN FETCH cr.cinemaComplex cc " +
           "JOIN FETCH cc.address a " +
           "WHERE mv.movie.movieId = :movieId " +
           "AND s.startTime >= :startOfDay " +
           "AND s.startTime < :endOfDay " +
           "ORDER BY cc.name ASC, s.startTime ASC")
    List<Showtime> findPublicShowtimesWithoutProvince(@Param("movieId") Long movieId, 
                                                       @Param("startOfDay") java.time.LocalDateTime startOfDay,
                                                       @Param("endOfDay") java.time.LocalDateTime endOfDay);
    
    /**
     * Test query: Lấy tất cả showtimes theo movieId (không filter gì cả) - để debug
     * Query trực tiếp qua MovieVersion để đảm bảo lấy được đúng
     */
    @Query("SELECT s FROM Showtime s " +
           "JOIN FETCH s.movieVersion mv " +
           "JOIN FETCH mv.movie m " +
           "JOIN FETCH s.cinemaRoom cr " +
           "JOIN FETCH cr.cinemaComplex cc " +
           "JOIN FETCH cc.address a " +
           "WHERE mv.movie.movieId = :movieId " +
           "ORDER BY s.startTime ASC")
    List<Showtime> findAllByMovieId(@Param("movieId") Long movieId);
}

