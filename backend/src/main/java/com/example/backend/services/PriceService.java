package com.example.backend.services;

import com.example.backend.dtos.PriceRequestDTO;
import com.example.backend.entities.Price;
import com.example.backend.repositories.PriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceService {

    private final PriceRepository priceRepository;

    public List<Price> getAll() {
        return priceRepository.findAll();
    }

    public List<Price> saveAll(List<PriceRequestDTO> reqList) {

        reqList.forEach(req -> {
            Price existing = priceRepository
                    .findByRoomTypeAndSeatType(req.getRoomType(), req.getSeatType())
                    .orElse(null);

            if (existing != null) {
                // Update price thôi
                existing.setPrice(req.getPrice());
                priceRepository.save(existing);
            } else {
                // Thêm mới
                Price price = Price.builder()
                        .roomType(req.getRoomType())
                        .seatType(req.getSeatType())
                        .price(req.getPrice())
                        .build();
                priceRepository.save(price);
            }
        });
        return priceRepository.findAll();
    }
}
