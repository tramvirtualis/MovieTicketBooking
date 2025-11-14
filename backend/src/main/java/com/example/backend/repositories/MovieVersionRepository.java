package com.example.backend.repositories;

import com.example.backend.entities.Movie;
import com.example.backend.entities.MovieVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieVersionRepository extends JpaRepository<MovieVersion, Long> {
    List<MovieVersion> findByMovie(Movie movie);
}

