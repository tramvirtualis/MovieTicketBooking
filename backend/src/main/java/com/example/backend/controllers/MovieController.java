package com.example.backend.controllers;

import com.example.backend.dtos.CreateMovieDTO;
import com.example.backend.dtos.MovieResponseDTO;
import com.example.backend.dtos.UpdateMovieDTO;
import com.example.backend.services.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, 
             allowedHeaders = "*", 
             allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class MovieController {
    
    private final MovieService movieService;
    
    @PostMapping
    public ResponseEntity<?> createMovie(@Valid @RequestBody CreateMovieDTO createMovieDTO,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    createErrorResponse(bindingResult)
            );
        }
        
        try {
            MovieResponseDTO movieResponse = movieService.createMovie(createMovieDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    createSuccessResponse("Tạo phim thành công", movieResponse)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{movieId}")
    public ResponseEntity<?> updateMovie(@PathVariable Long movieId,
                                         @Valid @RequestBody UpdateMovieDTO updateMovieDTO,
                                         BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                    createErrorResponse(bindingResult)
            );
        }
        
        try {
            MovieResponseDTO movieResponse = movieService.updateMovie(movieId, updateMovieDTO);
            return ResponseEntity.ok(
                    createSuccessResponse("Cập nhật phim thành công", movieResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{movieId}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long movieId) {
        try {
            movieService.deleteMovie(movieId);
            return ResponseEntity.ok(
                    createSuccessResponse("Xóa phim thành công", null)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/{movieId}")
    public ResponseEntity<?> getMovieById(@PathVariable Long movieId) {
        try {
            MovieResponseDTO movieResponse = movieService.getMovieById(movieId);
            return ResponseEntity.ok(
                    createSuccessResponse("Lấy thông tin phim thành công", movieResponse)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllMovies() {
        try {
            List<MovieResponseDTO> movies = movieService.getAllMovies();
            return ResponseEntity.ok(
                    createSuccessResponse("Lấy danh sách phim thành công", movies)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        }
    }
    
    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
    
    private Map<String, Object> createErrorResponse(BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        
        String errors = bindingResult.getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        
        response.put("message", errors);
        return response;
    }
}

