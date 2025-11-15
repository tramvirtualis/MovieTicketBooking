package com.example.backend.services;

import com.example.backend.dtos.CreateMovieDTO;
import com.example.backend.dtos.MovieResponseDTO;
import com.example.backend.dtos.UpdateMovieDTO;
import com.example.backend.entities.Movie;
import com.example.backend.entities.MovieVersion;
import com.example.backend.entities.enums.Language;
import com.example.backend.entities.enums.MovieStatus;
import com.example.backend.entities.enums.RoomType;
import com.example.backend.repositories.MovieRepository;
import com.example.backend.repositories.MovieVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {
    
    private final MovieRepository movieRepository;
    private final MovieVersionRepository movieVersionRepository;
    
    // ============ ADMIN METHODS (GIỮ NGUYÊN) ============
    
    @Transactional
    public MovieResponseDTO createMovie(CreateMovieDTO createMovieDTO) {
        Movie movie = Movie.builder()
                .title(createMovieDTO.getTitle())
                .genre(createMovieDTO.getGenre())
                .duration(createMovieDTO.getDuration())
                .releaseDate(createMovieDTO.getReleaseDate())
                .ageRating(createMovieDTO.getAgeRating())
                .actor(createMovieDTO.getActor())
                .director(createMovieDTO.getDirector())
                .description(createMovieDTO.getDescription())
                .trailerURL(createMovieDTO.getTrailerURL())
                .poster(createMovieDTO.getPoster())
                .status(createMovieDTO.getStatus())
                .build();
        
        Movie savedMovie = movieRepository.save(movie);
        
        if (createMovieDTO.getFormats() != null && createMovieDTO.getLanguages() != null) {
            List<MovieVersion> versions = new ArrayList<>();
            for (RoomType format : createMovieDTO.getFormats()) {
                for (Language language : createMovieDTO.getLanguages()) {
                    MovieVersion version = MovieVersion.builder()
                            .movie(savedMovie)
                            .roomType(format)
                            .language(language)
                            .build();
                    versions.add(version);
                }
            }
            movieVersionRepository.saveAll(versions);
        }
        
        return convertToDTO(savedMovie);
    }
    
    @Transactional
    public MovieResponseDTO updateMovie(Long movieId, UpdateMovieDTO updateMovieDTO) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + movieId));
        
        if (updateMovieDTO.getTitle() != null) {
            movie.setTitle(updateMovieDTO.getTitle());
        }
        if (updateMovieDTO.getGenre() != null) {
            movie.setGenre(updateMovieDTO.getGenre());
        }
        if (updateMovieDTO.getDuration() != null) {
            movie.setDuration(updateMovieDTO.getDuration());
        }
        if (updateMovieDTO.getReleaseDate() != null) {
            movie.setReleaseDate(updateMovieDTO.getReleaseDate());
        }
        if (updateMovieDTO.getAgeRating() != null) {
            movie.setAgeRating(updateMovieDTO.getAgeRating());
        }
        if (updateMovieDTO.getActor() != null) {
            movie.setActor(updateMovieDTO.getActor());
        }
        if (updateMovieDTO.getDirector() != null) {
            movie.setDirector(updateMovieDTO.getDirector());
        }
        if (updateMovieDTO.getDescription() != null) {
            movie.setDescription(updateMovieDTO.getDescription());
        }
        if (updateMovieDTO.getTrailerURL() != null) {
            movie.setTrailerURL(updateMovieDTO.getTrailerURL());
        }
        if (updateMovieDTO.getPoster() != null) {
            movie.setPoster(updateMovieDTO.getPoster());
        }
        if (updateMovieDTO.getStatus() != null) {
            movie.setStatus(updateMovieDTO.getStatus());
        }
        
        Movie updatedMovie = movieRepository.save(movie);
        
        if (updateMovieDTO.getFormats() != null && updateMovieDTO.getLanguages() != null) {
            List<MovieVersion> existingVersions = movieVersionRepository.findByMovie(updatedMovie);
            movieVersionRepository.deleteAll(existingVersions);
            
            List<MovieVersion> versions = new ArrayList<>();
            for (RoomType format : updateMovieDTO.getFormats()) {
                for (Language language : updateMovieDTO.getLanguages()) {
                    MovieVersion version = MovieVersion.builder()
                            .movie(updatedMovie)
                            .roomType(format)
                            .language(language)
                            .build();
                    versions.add(version);
                }
            }
            movieVersionRepository.saveAll(versions);
        }
        
        return convertToDTO(updatedMovie);
    }
    
    @Transactional
    public void deleteMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + movieId));
        
        movieRepository.delete(movie);
    }
    
    public MovieResponseDTO getMovieById(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + movieId));
        
        return convertToDTO(movie);
    }
    
    public List<MovieResponseDTO> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // ============ PUBLIC METHODS (MỚI THÊM) ============
    
    public List<MovieResponseDTO> getNowShowingMovies() {
        List<Movie> movies = movieRepository.findNowShowingMovies();
        return movies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MovieResponseDTO> getComingSoonMovies() {
        List<Movie> movies = movieRepository.findComingSoonMovies();
        return movies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MovieResponseDTO> getMoviesByStatus(MovieStatus status) {
        List<Movie> movies = movieRepository.findByStatus(status);
        return movies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // ============ HELPER METHOD ============
    
    private MovieResponseDTO convertToDTO(Movie movie) {
        List<MovieVersion> versions = movieVersionRepository.findByMovie(movie);
        
        List<RoomType> formats = versions.stream()
                .map(MovieVersion::getRoomType)
                .distinct()
                .collect(Collectors.toList());
        
        List<Language> languages = versions.stream()
                .map(MovieVersion::getLanguage)
                .distinct()
                .collect(Collectors.toList());
        
        return MovieResponseDTO.builder()
                .movieId(movie.getMovieId())
                .title(movie.getTitle())
                .genre(movie.getGenre())
                .duration(movie.getDuration())
                .releaseDate(movie.getReleaseDate())
                .ageRating(movie.getAgeRating())
                .actor(movie.getActor())
                .director(movie.getDirector())
                .description(movie.getDescription())
                .trailerURL(movie.getTrailerURL())
                .poster(movie.getPoster())
                .status(movie.getStatus())
                .formats(formats)
                .languages(languages)
                .build();
    }
}