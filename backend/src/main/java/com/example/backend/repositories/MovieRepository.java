package com.example.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Movie;
import com.example.backend.entities.enums.MovieStatus;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    
    // Tìm phim theo trạng thái
    List<Movie> findByStatus(MovieStatus status);
    
    // Tìm phim đang chiếu, sắp xếp theo ngày phát hành mới nhất
    @Query("SELECT m FROM Movie m WHERE m.status = 'NOW_SHOWING' ORDER BY m.releaseDate DESC")
    List<Movie> findNowShowingMovies();
    
    // Tìm phim sắp chiếu, sắp xếp theo ngày phát hành
    @Query("SELECT m FROM Movie m WHERE m.status = 'COMING_SOON' ORDER BY m.releaseDate ASC")
    List<Movie> findComingSoonMovies();
}