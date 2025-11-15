package com.example.backend.repositories;

import com.example.backend.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovieMovieId(Long movieId);
    List<Review> findByUserUserId(Long userId);
    Optional<Review> findByUserUserIdAndMovieMovieId(Long userId, Long movieId);
}


