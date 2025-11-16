package com.example.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dtos.CreateReviewDTO;
import com.example.backend.dtos.ReviewResponseDTO;
import com.example.backend.entities.Movie;
import com.example.backend.entities.Review;
import com.example.backend.entities.User;
import com.example.backend.repositories.MovieRepository;
import com.example.backend.repositories.ReviewRepository;
import com.example.backend.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ReviewResponseDTO createReview(CreateReviewDTO createReviewDTO) {
        // Lấy username từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Tìm user
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng");
        }
        User user = userOpt.get();
        
        // Tìm movie
        Optional<Movie> movieOpt = movieRepository.findById(createReviewDTO.getMovieId());
        if (movieOpt.isEmpty()) {
            throw new RuntimeException("Không tìm thấy phim");
        }
        Movie movie = movieOpt.get();
        
        // Kiểm tra xem user đã đánh giá phim này chưa
        Optional<Review> existingReview = reviewRepository.findByUserUserIdAndMovieMovieId(
            user.getUserId(), 
            createReviewDTO.getMovieId()
        );
        
        Review review;
        if (existingReview.isPresent()) {
            // Cập nhật đánh giá đã có
            review = existingReview.get();
            review.setRating(createReviewDTO.getRating());
            review.setContext(createReviewDTO.getContext());
            review.setCreatedUpdate(LocalDateTime.now());
        } else {
            // Tạo đánh giá mới
            review = Review.builder()
                .user(user)
                .movie(movie)
                .rating(createReviewDTO.getRating())
                .context(createReviewDTO.getContext())
                .createdAt(LocalDateTime.now())
                .createdUpdate(LocalDateTime.now())
                .build();
        }
        
        Review savedReview = reviewRepository.save(review);
        
        return mapToDTO(savedReview);
    }
    
    public List<ReviewResponseDTO> getReviewsByMovie(Long movieId) {
        List<Review> reviews = reviewRepository.findByMovieMovieId(movieId);
        return reviews.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<ReviewResponseDTO> getReviewsByUser(Long userId) {
        List<Review> reviews = reviewRepository.findByUserUserId(userId);
        return reviews.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private ReviewResponseDTO mapToDTO(Review review) {
        return ReviewResponseDTO.builder()
            .reviewId(review.getReviewId())
            .userId(review.getUser().getUserId())
            .username(review.getUser().getUsername())
            .movieId(review.getMovie().getMovieId())
            .movieTitle(review.getMovie().getTitle())
            .rating(review.getRating())
            .context(review.getContext())
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getCreatedUpdate())
            .build();
    }
}


