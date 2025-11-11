package com.example.backend.entities;

import com.example.backend.entities.enums.AgeRating;
import com.example.backend.entities.enums.Genre;
import com.example.backend.entities.enums.MovieStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Long movieId;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "genre", nullable = false)
    private Genre genre;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "age_rating", nullable = false)
    private AgeRating ageRating;

    @Column(name = "actor")
    private String actor;

    @Column(name = "director")
    private String director;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "trailer_url")
    private String trailerURL;

    @Column(name = "poster")
    private String poster;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MovieStatus status;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MovieVersion> movieVersions = new ArrayList<>();

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    @ManyToMany(mappedBy = "favorites")
    private List<Customer> customers = new ArrayList<>();
}

