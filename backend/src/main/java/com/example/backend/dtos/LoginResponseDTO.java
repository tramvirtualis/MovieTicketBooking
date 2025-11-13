package com.example.backend.dtos;

import com.example.backend.entities.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private Long userId;
    private String username;
    private String email;
    private String phone;
    private Boolean status;
    private Address address;
    private String role;
    private String token;
}
