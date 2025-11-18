package com.example.backend.services;

import com.example.backend.dtos.PriceDTO;
import com.example.backend.dtos.UpdatePricesRequestDTO;
import com.example.backend.entities.Price;
import com.example.backend.entities.enums.RoomType;
import com.example.backend.entities.enums.SeatType;
import com.example.backend.repositories.PriceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PriceService {
    
    private final PriceRepository priceRepository;
    
    // Constructor for dependency injection
    public PriceService(PriceRepository priceRepository) {
        this.priceRepository = priceRepository;
    }
    
    /**
     * Lấy tất cả giá từ database
     * @return Danh sách PriceDTO
     */
    public List<PriceDTO> getAllPrices() {
        return priceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PriceDTO getPriceByRoomTypeAndSeatType(RoomType roomType, SeatType seatType) {
        return priceRepository.findByRoomTypeAndSeatType(roomType, seatType)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    @Transactional
    public List<PriceDTO> updatePrices(UpdatePricesRequestDTO request) {
        List<PriceDTO> priceDTOs = request.getPrices();
        
        if (priceDTOs == null || priceDTOs.isEmpty()) {
            throw new IllegalArgumentException("Danh sách giá không được để trống");
        }
        
        for (PriceDTO priceDTO : priceDTOs) {
            RoomType roomType = priceDTO.getRoomType();
            SeatType seatType = priceDTO.getSeatType();
            BigDecimal price = priceDTO.getPrice();
            
            // Validate roomType and seatType
            if (roomType == null) {
                System.err.println("Warning: roomType is null for price: " + priceDTO);
                continue;
            }
            
            if (seatType == null) {
                System.err.println("Warning: seatType is null for price: " + priceDTO);
                continue;
            }
            
            // Validate price
            if (price == null) {
                System.err.println("Warning: price is null for: " + priceDTO);
                continue;
            }
            
            if (price.compareTo(BigDecimal.ZERO) < 0) {
                System.err.println("Warning: price is negative, skipping: " + priceDTO);
                continue;
            }
            
            Optional<Price> existingPrice = priceRepository.findByRoomTypeAndSeatType(roomType, seatType);
            
            if (existingPrice.isPresent()) {
                // Update existing price
                Price priceEntity = existingPrice.get();
                System.out.println("Found existing price with ID: " + priceEntity.getId());
                priceEntity.setPrice(price);
                Price saved = priceRepository.save(priceEntity);
                System.out.println("✓ Updated price in DB: " + roomType + " - " + seatType + " = " + price + " (ID: " + saved.getId() + ")");
            } else {
                // Create new price
                System.out.println("Creating new price: " + roomType + " - " + seatType + " = " + price);
                Price newPrice = Price.builder()
                        .roomType(roomType)
                        .seatType(seatType)
                        .price(price)
                        .build();
                Price saved = priceRepository.save(newPrice);
                System.out.println("✓ Created new price in DB: " + roomType + " - " + seatType + " = " + price + " (ID: " + saved.getId() + ")");
                
                // Verify it was saved
                Optional<Price> verify = priceRepository.findById(saved.getId());
                if (verify.isPresent()) {
                    System.out.println("✓ Verified: Price saved successfully with ID: " + saved.getId());
                } else {
                    System.err.println("✗ ERROR: Price was not saved! ID: " + saved.getId());
                }
            }
        }
        
        return getAllPrices();
    }
    
    @Transactional
    public PriceDTO createOrUpdatePrice(PriceDTO priceDTO) {
        RoomType roomType = priceDTO.getRoomType();
        SeatType seatType = priceDTO.getSeatType();
        BigDecimal price = priceDTO.getPrice();
        
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá không hợp lệ");
        }
        
        Optional<Price> existingPrice = priceRepository.findByRoomTypeAndSeatType(roomType, seatType);
        
        if (existingPrice.isPresent()) {
            Price priceEntity = existingPrice.get();
            priceEntity.setPrice(price);
            return convertToDTO(priceRepository.save(priceEntity));
        } else {
            Price newPrice = Price.builder()
                    .roomType(roomType)
                    .seatType(seatType)
                    .price(price)
                    .build();
            return convertToDTO(priceRepository.save(newPrice));
        }
    }
    
    @Transactional
    public void deletePrice(Long id) {
        if (!priceRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy bảng giá với ID: " + id);
        }
        priceRepository.deleteById(id);
    }
    
    private PriceDTO convertToDTO(Price price) {
        return PriceDTO.builder()
                .id(price.getId())
                .roomType(price.getRoomType())
                .seatType(price.getSeatType())
                .price(price.getPrice())
                .build();
    }
}

