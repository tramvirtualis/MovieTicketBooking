package com.example.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

import com.example.backend.entities.enums.Genre;
import com.example.backend.entities.enums.MovieStatus;
import com.example.backend.entities.enums.AgeRating;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movieId;

    private String title;

    @Enumerated(EnumType.STRING)
    private Genre genre;

    private Integer duration;
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    private AgeRating ageRating;

    private String actor;
    private String director;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String trailerURL;
    
    @Column(columnDefinition = "LONGTEXT")
    private String poster; // Hỗ trợ URL dài hoặc base64 image

    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<MovieVersion> versions;

    @OneToMany(mappedBy = "movie")
    private List<Review> reviews;
}
