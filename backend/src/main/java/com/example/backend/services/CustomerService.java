package com.example.backend.services;

import com.example.backend.dtos.UpdateCustomerProfileRequestDTO;
import com.example.backend.entities.Address;
import com.example.backend.entities.Customer;
import com.example.backend.entities.User;
import com.example.backend.repositories.AddressRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

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
}
