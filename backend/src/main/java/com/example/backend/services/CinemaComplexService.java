package com.example.backend.services;

import com.example.backend.dtos.CinemaComplexResponseDTO;
import com.example.backend.dtos.CreateCinemaComplexDTO;
import com.example.backend.entities.Address;
import com.example.backend.entities.CinemaComplex;
import com.example.backend.entities.Movie;
import com.example.backend.repositories.AddressRepository;
import com.example.backend.repositories.CinemaComplexRepository;
import com.example.backend.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaComplexService {
    
    private final CinemaComplexRepository cinemaComplexRepository;
    private final AddressRepository addressRepository;
    private final MovieRepository movieRepository;
    
    public List<CinemaComplexResponseDTO> getAllCinemaComplexes() {
        return cinemaComplexRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public CinemaComplexResponseDTO getCinemaComplexById(Long complexId) {
        CinemaComplex complex = cinemaComplexRepository.findById(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + complexId));
        return mapToDTO(complex);
    }
    
    public List<CinemaComplexResponseDTO> getCinemaComplexesByManager(Long complexId) {
        // Manager chỉ có thể xem cụm rạp của mình
        if (complexId == null) {
            return List.of();
        }
        return cinemaComplexRepository.findById(complexId)
            .map(complex -> List.of(mapToDTO(complex)))
            .orElse(List.of());
    }
    
    @Transactional
    public CinemaComplexResponseDTO createCinemaComplex(CreateCinemaComplexDTO createDTO) {
        // Tạo Address
        Address address = Address.builder()
            .description(createDTO.getAddressDescription())
            .province(createDTO.getAddressProvince())
            .build();
        Address savedAddress = addressRepository.save(address);
        
        // Tạo CinemaComplex
        CinemaComplex complex = CinemaComplex.builder()
            .name(createDTO.getName())
            .address(savedAddress)
            .build();
        
        CinemaComplex savedComplex = cinemaComplexRepository.save(complex);
        return mapToDTO(savedComplex);
    }
    
    @Transactional
    public CinemaComplexResponseDTO updateCinemaComplex(Long complexId, CreateCinemaComplexDTO updateDTO) {
        CinemaComplex complex = cinemaComplexRepository.findById(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + complexId));
        
        // Cập nhật tên
        complex.setName(updateDTO.getName());
        
        // Cập nhật Address
        Address address = complex.getAddress();
        if (address == null) {
            // Tạo Address mới nếu chưa có
            address = Address.builder()
                .description(updateDTO.getAddressDescription())
                .province(updateDTO.getAddressProvince())
                .build();
            address = addressRepository.save(address);
            complex.setAddress(address);
        } else {
            // Cập nhật Address hiện có
            address.setDescription(updateDTO.getAddressDescription());
            address.setProvince(updateDTO.getAddressProvince());
            addressRepository.save(address);
        }
        
        CinemaComplex updatedComplex = cinemaComplexRepository.save(complex);
        return mapToDTO(updatedComplex);
    }
    
    @Transactional
    public void deleteCinemaComplex(Long complexId) {
        CinemaComplex complex = cinemaComplexRepository.findById(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + complexId));
        
        // Xóa Address (cascade sẽ xử lý các quan hệ khác)
        if (complex.getAddress() != null) {
            addressRepository.delete(complex.getAddress());
        }
        
        cinemaComplexRepository.delete(complex);
    }

    // ============ MOVIE MANAGEMENT METHODS ============

    /**
     * Lấy danh sách phim của cụm rạp
     */
    @Transactional(readOnly = true)
    public List<Movie> getMoviesByComplexId(Long complexId) {
        CinemaComplex complex = cinemaComplexRepository.findByIdWithMovies(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + complexId));
        
        if (complex.getMovies() == null) {
            return new ArrayList<>();
        }
        return complex.getMovies();
    }

    /**
     * Thêm phim vào cụm rạp
     */
    @Transactional
    public void addMovieToComplex(Long complexId, Long movieId) {
        CinemaComplex complex = cinemaComplexRepository.findByIdWithMovies(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + complexId));
        
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + movieId));
        
        // Initialize movies list if null
        if (complex.getMovies() == null) {
            complex.setMovies(new ArrayList<>());
        }
        
        // Check if movie already exists
        boolean alreadyExists = complex.getMovies().stream()
            .anyMatch(m -> m.getMovieId().equals(movieId));
        
        if (alreadyExists) {
            throw new RuntimeException("Phim này đã có trong danh sách cụm rạp");
        }
        
        // Add movie to complex
        complex.getMovies().add(movie);
        cinemaComplexRepository.save(complex);
    }

    /**
     * Xóa phim khỏi cụm rạp
     */
    @Transactional
    public void removeMovieFromComplex(Long complexId, Long movieId) {
        CinemaComplex complex = cinemaComplexRepository.findByIdWithMovies(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + complexId));
        
        // Initialize movies list if null
        if (complex.getMovies() == null) {
            complex.setMovies(new ArrayList<>());
        }
        
        // Check if movie exists
        boolean exists = complex.getMovies().stream()
            .anyMatch(m -> m.getMovieId().equals(movieId));
        
        if (!exists) {
            throw new RuntimeException("Phim này không có trong danh sách cụm rạp");
        }
        
        // Remove movie from complex
        complex.setMovies(
            complex.getMovies().stream()
                .filter(m -> !m.getMovieId().equals(movieId))
                .collect(Collectors.toList())
        );
        cinemaComplexRepository.save(complex);
    }
    
    private CinemaComplexResponseDTO mapToDTO(CinemaComplex complex) {
        String addressDescription = complex.getAddress() != null ? complex.getAddress().getDescription() : "";
        String addressProvince = complex.getAddress() != null ? complex.getAddress().getProvince() : "";
        String fullAddress = addressDescription + (addressProvince.isEmpty() ? "" : ", " + addressProvince);
        
        return CinemaComplexResponseDTO.builder()
            .complexId(complex.getComplexId())
            .name(complex.getName())
            .addressDescription(addressDescription)
            .addressProvince(addressProvince)
            .fullAddress(fullAddress)
            .build();
    }
}

