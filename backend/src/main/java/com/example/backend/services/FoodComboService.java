package com.example.backend.services;

import com.example.backend.dtos.CreateFoodComboDTO;
import com.example.backend.dtos.FoodComboResponseDTO;
import com.example.backend.entities.FoodCombo;
import com.example.backend.repositories.FoodComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodComboService {
    
    private final FoodComboRepository foodComboRepository;
    
    @Transactional
    public FoodComboResponseDTO createFoodCombo(CreateFoodComboDTO createDTO) {
        FoodCombo foodCombo = FoodCombo.builder()
            .name(createDTO.getName())
            .price(createDTO.getPrice())
            .description(createDTO.getDescription())
            .image(createDTO.getImage())
            .build();
        
        FoodCombo saved = foodComboRepository.save(foodCombo);
        return mapToDTO(saved);
    }
    
    @Transactional
    public FoodComboResponseDTO updateFoodCombo(Long id, CreateFoodComboDTO updateDTO) {
        FoodCombo foodCombo = foodComboRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        
        foodCombo.setName(updateDTO.getName());
        foodCombo.setPrice(updateDTO.getPrice());
        foodCombo.setDescription(updateDTO.getDescription());
        foodCombo.setImage(updateDTO.getImage());
        
        FoodCombo saved = foodComboRepository.save(foodCombo);
        return mapToDTO(saved);
    }
    
    public List<FoodComboResponseDTO> getAllFoodCombos() {
        return foodComboRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<FoodComboResponseDTO> getAvailableFoodCombos() {
        // Tất cả food combos đều available (không có status field)
        return foodComboRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public FoodComboResponseDTO getFoodComboById(Long id) {
        FoodCombo foodCombo = foodComboRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        return mapToDTO(foodCombo);
    }
    
    @Transactional
    public void deleteFoodCombo(Long id) {
        if (!foodComboRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }
        foodComboRepository.deleteById(id);
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

