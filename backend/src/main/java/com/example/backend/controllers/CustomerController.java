package com.example.backend.controllers;

import com.example.backend.dtos.MovieResponseDTO;
import com.example.backend.dtos.UpdateCustomerProfileRequestDTO;
import com.example.backend.dtos.VoucherResponseDTO;
import com.example.backend.entities.Customer;
import com.example.backend.repositories.CustomerRepository;
import com.example.backend.services.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"},
        allowedHeaders = "*",
        allowCredentials = "true")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepository;

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerProfileRequestDTO request) {

        try {
            Customer updatedCustomer = customerService.updateProfile(id, request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thông tin thành công");
            response.put("data", updatedCustomer);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // lỗi do business logic
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            // lỗi bất ngờ
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createErrorResponse(BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);

        String errors = bindingResult.getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        response.put("message", errors);
        return response;
    }

    private Long getCurrentCustomerId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với username: " + username));
        return customer.getUserId();
    }

    @GetMapping("/vouchers")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getUserVouchers() {
        try {
            Long userId = getCurrentCustomerId();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách voucher thành công");
            response.put("data", customerService.getUserVouchers(userId));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    @PostMapping("/vouchers/{voucherId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> saveVoucher(@PathVariable Long voucherId) {
        try {
            Long userId = getCurrentCustomerId();
            VoucherResponseDTO voucher = customerService.saveVoucher(userId, voucherId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lưu voucher thành công");
            response.put("data", voucher);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    @DeleteMapping("/vouchers/{voucherId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> removeVoucher(@PathVariable Long voucherId) {
        try {
            Long userId = getCurrentCustomerId();
            customerService.removeVoucher(userId, voucherId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa voucher thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    @GetMapping("/vouchers/{voucherId}/check")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> checkVoucher(@PathVariable Long voucherId) {
        try {
            Long userId = getCurrentCustomerId();
            boolean hasVoucher = customerService.hasVoucher(userId, voucherId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasVoucher", hasVoucher);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    // ============ FAVORITE MOVIES ENDPOINTS ============

    @GetMapping("/favorites")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getFavoriteMovies() {
        try {
            Long userId = getCurrentCustomerId();
            List<MovieResponseDTO> movies = customerService.getFavoriteMovies(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách phim yêu thích thành công");
            response.put("data", movies);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    @PostMapping("/favorites/{movieId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> addFavorite(@PathVariable Long movieId) {
        try {
            Long userId = getCurrentCustomerId();
            MovieResponseDTO movie = customerService.addFavorite(userId, movieId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thêm phim vào yêu thích thành công");
            response.put("data", movie);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    @DeleteMapping("/favorites/{movieId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> removeFavorite(@PathVariable Long movieId) {
        try {
            Long userId = getCurrentCustomerId();
            customerService.removeFavorite(userId, movieId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa phim khỏi yêu thích thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    @GetMapping("/favorites/{movieId}/check")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> checkFavorite(@PathVariable Long movieId) {
        try {
            Long userId = getCurrentCustomerId();
            boolean hasFavorite = customerService.hasFavorite(userId, movieId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("hasFavorite", hasFavorite);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }
}
