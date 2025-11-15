package com.example.backend.services;

import com.example.backend.dtos.FoodComboResponseDTO;
import com.example.backend.entities.CinemaComplex;
import com.example.backend.entities.FoodCombo;
import com.example.backend.repositories.CinemaComplexRepository;
import com.example.backend.repositories.FoodComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaComplexMenuService {
    
    private final CinemaComplexRepository cinemaComplexRepository;
    private final FoodComboRepository foodComboRepository;
    
    public List<FoodComboResponseDTO> getMenuByComplexId(Long complexId) {
        CinemaComplex complex = cinemaComplexRepository.findById(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp"));
        
        return complex.getFoodCombos().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<FoodComboResponseDTO> getAvailableFoodCombos() {
        // Tất cả food combos đều available
        return foodComboRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public FoodComboResponseDTO addFoodComboToMenu(Long complexId, Long foodComboId) {
        CinemaComplex complex = cinemaComplexRepository.findById(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp"));
        
        FoodCombo foodCombo = foodComboRepository.findById(foodComboId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        
        if (complex.getFoodCombos().contains(foodCombo)) {
            throw new RuntimeException("Sản phẩm đã có trong menu");
        }
        
        complex.getFoodCombos().add(foodCombo);
        cinemaComplexRepository.save(complex);
        
        return mapToDTO(foodCombo);
    }
    
    @Transactional
    public void removeFoodComboFromMenu(Long complexId, Long foodComboId) {
        CinemaComplex complex = cinemaComplexRepository.findById(complexId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp"));
        
        FoodCombo foodCombo = foodComboRepository.findById(foodComboId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        
        if (!complex.getFoodCombos().contains(foodCombo)) {
            throw new RuntimeException("Sản phẩm không có trong menu");
        }
        
        complex.getFoodCombos().remove(foodCombo);
        cinemaComplexRepository.save(complex);
    }
    
    private FoodComboResponseDTO mapToDTO(FoodCombo foodCombo) {
        return FoodComboResponseDTO.builder()
            .foodComboId(foodCombo.getFoodComboId())
            .name(foodCombo.getName())
            .price(foodCombo.getPrice())
            .description(foodCombo.getDescription())
            .image(foodCombo.getImage())
            .build();
    }
}

