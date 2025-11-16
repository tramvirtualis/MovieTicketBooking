package com.example.backend.services;

import com.example.backend.dtos.BannerResponseDTO;
import com.example.backend.dtos.CreateBannerDTO;
import com.example.backend.dtos.UpdateBannerDTO;
import com.example.backend.entities.Banner;
import com.example.backend.repositories.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {
    
    private final BannerRepository bannerRepository;
    
    @Transactional
    public BannerResponseDTO createBanner(CreateBannerDTO createDTO) {
        Banner banner = Banner.builder()
                .image(createDTO.getImage() != null ? createDTO.getImage().trim() : null)
                .build();
        
        Banner savedBanner = bannerRepository.save(banner);
        return convertToDTO(savedBanner);
    }
    
    @Transactional
    public BannerResponseDTO updateBanner(Long bannerId, UpdateBannerDTO updateDTO) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner với ID: " + bannerId));
        
        if (updateDTO.getImage() != null) {
            banner.setImage(updateDTO.getImage().trim());
        }
        
        Banner updatedBanner = bannerRepository.save(banner);
        return convertToDTO(updatedBanner);
    }
    
    @Transactional
    public void deleteBanner(Long bannerId) {
        if (!bannerRepository.existsById(bannerId)) {
            throw new RuntimeException("Không tìm thấy banner với ID: " + bannerId);
        }
        bannerRepository.deleteById(bannerId);
    }
    
    public BannerResponseDTO getBannerById(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy banner với ID: " + bannerId));
        return convertToDTO(banner);
    }
    
    public List<BannerResponseDTO> getAllBanners() {
        return bannerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private BannerResponseDTO convertToDTO(Banner banner) {
        return BannerResponseDTO.builder()
                .id(banner.getId())
                .image(banner.getImage())
                .build();
    }
}

