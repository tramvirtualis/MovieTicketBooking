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
    private String description;
    private String trailerURL;
    private String poster;

    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<MovieVersion> versions;

    @OneToMany(mappedBy = "movie")
    private List<Review> reviews;
}
