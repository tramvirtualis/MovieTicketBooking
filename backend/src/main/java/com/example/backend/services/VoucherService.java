package com.example.backend.services;

import com.example.backend.dtos.CreateVoucherDTO;
import com.example.backend.dtos.UpdateVoucherDTO;
import com.example.backend.dtos.VoucherResponseDTO;
import com.example.backend.entities.Voucher;
import com.example.backend.entities.enums.VoucherScope;
import com.example.backend.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoucherService {
    
    private final VoucherRepository voucherRepository;
    
    @Transactional
    public VoucherResponseDTO createVoucher(CreateVoucherDTO createDTO) {
        // Kiểm tra mã voucher đã tồn tại chưa
        if (voucherRepository.existsByCode(createDTO.getCode())) {
            throw new RuntimeException("Mã voucher đã tồn tại: " + createDTO.getCode());
        }
        
        // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
        if (createDTO.getStartDate().isAfter(createDTO.getEndDate())) {
            throw new RuntimeException("Ngày bắt đầu phải trước ngày kết thúc");
        }
        
        // Kiểm tra giá trị giảm giá hợp lệ
        if (createDTO.getDiscountType() == com.example.backend.entities.enums.DiscountType.PERCENT) {
            if (createDTO.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
                throw new RuntimeException("Giảm giá phần trăm không được vượt quá 100%");
            }
        }
        
        Voucher voucher = Voucher.builder()
                .code(createDTO.getCode().trim().toUpperCase())
                .name(createDTO.getName().trim())
                .description(createDTO.getDescription() != null ? createDTO.getDescription().trim() : null)
                .discountType(createDTO.getDiscountType())
                .discountValue(createDTO.getDiscountValue())
                .maxDiscountAmount(createDTO.getMaxDiscountAmount() != null ? createDTO.getMaxDiscountAmount() : java.math.BigDecimal.ZERO)
                .minOrderAmount(createDTO.getMinOrderAmount() != null ? createDTO.getMinOrderAmount() : java.math.BigDecimal.ZERO)
                .startDate(createDTO.getStartDate())
                .endDate(createDTO.getEndDate())
                .scope(createDTO.getScope())
                .image(createDTO.getImage() != null ? createDTO.getImage().trim() : null)
                .build();
        
        Voucher savedVoucher = voucherRepository.save(voucher);
        return convertToDTO(savedVoucher);
    }
    
    @Transactional
    public VoucherResponseDTO updateVoucher(Long voucherId, UpdateVoucherDTO updateDTO) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + voucherId));
        
        // Kiểm tra mã voucher đã tồn tại chưa (nếu thay đổi mã)
        if (updateDTO.getCode() != null && !updateDTO.getCode().equals(voucher.getCode())) {
            if (voucherRepository.existsByCode(updateDTO.getCode())) {
                throw new RuntimeException("Mã voucher đã tồn tại: " + updateDTO.getCode());
            }
            voucher.setCode(updateDTO.getCode().trim().toUpperCase());
        }
        
        if (updateDTO.getName() != null) {
            voucher.setName(updateDTO.getName().trim());
        }
        if (updateDTO.getDescription() != null) {
            voucher.setDescription(updateDTO.getDescription().trim());
        }
        if (updateDTO.getDiscountType() != null) {
            voucher.setDiscountType(updateDTO.getDiscountType());
        }
        if (updateDTO.getDiscountValue() != null) {
            voucher.setDiscountValue(updateDTO.getDiscountValue());
        }
        if (updateDTO.getMaxDiscountAmount() != null) {
            voucher.setMaxDiscountAmount(updateDTO.getMaxDiscountAmount());
        }
        if (updateDTO.getMinOrderAmount() != null) {
            voucher.setMinOrderAmount(updateDTO.getMinOrderAmount());
        }
        if (updateDTO.getStartDate() != null) {
            voucher.setStartDate(updateDTO.getStartDate());
        }
        if (updateDTO.getEndDate() != null) {
            voucher.setEndDate(updateDTO.getEndDate());
        }
        if (updateDTO.getScope() != null) {
            voucher.setScope(updateDTO.getScope());
        }
        if (updateDTO.getImage() != null) {
            voucher.setImage(updateDTO.getImage().trim());
        }
        
        // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
        if (voucher.getStartDate().isAfter(voucher.getEndDate())) {
            throw new RuntimeException("Ngày bắt đầu phải trước ngày kết thúc");
        }
        
        // Kiểm tra giá trị giảm giá hợp lệ
        if (voucher.getDiscountType() == com.example.backend.entities.enums.DiscountType.PERCENT) {
            if (voucher.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
                throw new RuntimeException("Giảm giá phần trăm không được vượt quá 100%");
            }
        }
        
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return convertToDTO(updatedVoucher);
    }
    
    @Transactional
    public void deleteVoucher(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + voucherId));
        voucherRepository.delete(voucher);
    }
    
    public VoucherResponseDTO getVoucherById(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + voucherId));
        return convertToDTO(voucher);
    }
    
    public List<VoucherResponseDTO> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<VoucherResponseDTO> getVouchersByScope(VoucherScope scope) {
        return voucherRepository.findByScope(scope).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private VoucherResponseDTO convertToDTO(Voucher voucher) {
        return VoucherResponseDTO.builder()
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderAmount(voucher.getMinOrderAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .scope(voucher.getScope())
                .image(voucher.getImage())
                .build();
    }
}


