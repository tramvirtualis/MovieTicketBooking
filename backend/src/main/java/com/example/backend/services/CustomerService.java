package com.example.backend.services;

import com.example.backend.dtos.UpdateCustomerProfileRequestDTO;
import com.example.backend.dtos.VoucherResponseDTO;
import com.example.backend.entities.Address;
import com.example.backend.entities.Customer;
import com.example.backend.entities.User;
import com.example.backend.entities.Voucher;
import com.example.backend.repositories.AddressRepository;
import com.example.backend.repositories.CustomerRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;
    private final VoucherRepository voucherRepository;

    public Customer updateProfile(Long userId, UpdateCustomerProfileRequestDTO req) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User không tồn tại"));

        if (!(user instanceof Customer customer)) {
            throw new Exception("User này không phải Customer");
        }

        customer.setName(req.getName());
        customer.setEmail(req.getEmail());
        customer.setPhone(req.getPhone());
        customer.setDob(req.getDob());

        Address address;
        if (customer.getAddress() == null) {
            address = Address.builder()
                    .description(req.getAddressDescription())
                    .province(req.getAddressProvince())
                    .build();
        } else {
            address = customer.getAddress();
            address.setDescription(req.getAddressDescription());
            address.setProvince(req.getAddressProvince());
        }

        addressRepository.save(address);
        customer.setAddress(address);

        return userRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<VoucherResponseDTO> getUserVouchers(Long userId) {
        Customer customer = customerRepository.findByIdWithVouchers(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + userId));

        if (customer.getVouchers() == null || customer.getVouchers().isEmpty()) {
            return new ArrayList<>();
        }

        return customer.getVouchers().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherResponseDTO saveVoucher(Long userId, Long voucherId) {
        Customer customer = customerRepository.findByIdWithVouchers(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + userId));

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + voucherId));

        // Initialize vouchers list if null
        if (customer.getVouchers() == null) {
            customer.setVouchers(new java.util.ArrayList<>());
        }

        // Kiểm tra voucher có phải PUBLIC không
        if (voucher.getScope() != com.example.backend.entities.enums.VoucherScope.PUBLIC) {
            throw new RuntimeException("Voucher này không phải voucher công khai");
        }

        // Kiểm tra xem voucher đã được lưu chưa (kiểm tra bằng voucherId thay vì object)
        boolean alreadyExists = customer.getVouchers().stream()
                .anyMatch(v -> v.getVoucherId().equals(voucherId));
        
        if (alreadyExists) {
            throw new RuntimeException("Voucher này đã được lưu");
        }

        // Add voucher to customer's list
        customer.getVouchers().add(voucher);
        customerRepository.save(customer);

        return mapToDTO(voucher);
    }

    @Transactional
    public void removeVoucher(Long userId, Long voucherId) {
        Customer customer = customerRepository.findByIdWithVouchers(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + userId));

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher với ID: " + voucherId));

        // Initialize vouchers list if null
        if (customer.getVouchers() == null) {
            customer.setVouchers(new ArrayList<>());
        }

        // Kiểm tra bằng voucherId
        boolean exists = customer.getVouchers().stream()
                .anyMatch(v -> v.getVoucherId().equals(voucherId));

        if (!exists) {
            throw new RuntimeException("Voucher này chưa được lưu");
        }

        // Remove voucher bằng cách filter
        customer.setVouchers(
            customer.getVouchers().stream()
                .filter(v -> !v.getVoucherId().equals(voucherId))
                .collect(Collectors.toList())
        );
        customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public boolean hasVoucher(Long userId, Long voucherId) {
        Customer customer = customerRepository.findByIdWithVouchers(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + userId));

        // Initialize vouchers list if null
        if (customer.getVouchers() == null) {
            return false;
        }

        // Kiểm tra bằng voucherId
        return customer.getVouchers().stream()
                .anyMatch(v -> v.getVoucherId().equals(voucherId));
    }

    private VoucherResponseDTO mapToDTO(Voucher voucher) {
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
