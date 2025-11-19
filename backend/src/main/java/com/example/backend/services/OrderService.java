package com.example.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dtos.OrderComboDTO;
import com.example.backend.dtos.OrderItemDTO;
import com.example.backend.dtos.OrderResponseDTO;
import com.example.backend.entities.CinemaComplex;
import com.example.backend.entities.CinemaRoom;
import com.example.backend.entities.Movie;
import com.example.backend.entities.MovieVersion;
import com.example.backend.entities.Order;
import com.example.backend.entities.Seat;
import com.example.backend.entities.Showtime;
import com.example.backend.repositories.OrderRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    
    // ==================== Methods from HEAD (for getting orders) ====================
    
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByUser(Long userId) {
        List<Order> orders = orderRepository.findByUserUserIdWithDetails(userId);
        return orders.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    private OrderResponseDTO mapToDTO(Order order) {
        // Map tickets to items
        List<OrderItemDTO> items = order.getTickets().stream()
            .map(ticket -> {
                Showtime showtime = ticket.getShowtime();
                Seat seat = ticket.getSeat();
                MovieVersion movieVersion = showtime.getMovieVersion();
                Movie movie = movieVersion.getMovie();
                CinemaRoom room = showtime.getCinemaRoom();
                CinemaComplex cinema = room.getCinemaComplex();
                
                OrderItemDTO item = new OrderItemDTO();
                item.setTicketId(ticket.getTicketId());
                item.setMovieId(movie.getMovieId());
                item.setMovieTitle(movie.getTitle());
                item.setMoviePoster(movie.getPoster());
                item.setCinemaComplexId(cinema.getComplexId());
                item.setCinemaComplexName(cinema.getName());
                item.setCinemaAddress(cinema.getAddress() != null 
                    ? (cinema.getAddress().getProvince() != null 
                        ? cinema.getAddress().getDescription() + ", " + cinema.getAddress().getProvince()
                        : cinema.getAddress().getDescription())
                    : "");
                item.setRoomId(room.getRoomId());
                item.setRoomName(room.getRoomName());
                item.setRoomType(mapRoomType(movieVersion.getRoomType()));
                item.setShowtimeStart(showtime.getStartTime());
                item.setShowtimeEnd(showtime.getEndTime());
                item.setSeatId(seat.getSeatRow() + seat.getSeatColumn());
                item.setSeatRow(seat.getSeatRow());
                item.setSeatColumn(seat.getSeatColumn());
                item.setPrice(ticket.getPrice());
                return item;
            })
            .collect(Collectors.toList());
        
        // Map order combos - load orderCombos lazily to avoid MultipleBagFetchException
        // Initialize orderCombos collection to trigger lazy loading
        if (order.getOrderCombos() != null) {
            order.getOrderCombos().size(); // Trigger lazy loading
        }
        
        List<OrderComboDTO> combos = order.getOrderCombos() != null 
            ? order.getOrderCombos().stream()
                .flatMap(oc -> {
                    // Initialize foodCombos collection to avoid N+1
                    if (oc.getFoodCombos() != null) {
                        oc.getFoodCombos().size(); // Trigger lazy loading
                    }
                    // Each OrderCombo can have multiple FoodCombos
                    if (oc.getFoodCombos() != null && !oc.getFoodCombos().isEmpty()) {
                        return oc.getFoodCombos().stream()
                            .map(fc -> {
                                OrderComboDTO combo = new OrderComboDTO();
                                combo.setComboId(fc.getFoodComboId());
                                combo.setComboName(fc.getName());
                                combo.setComboImage(fc.getImage());
                                combo.setQuantity(oc.getQuantity());
                                combo.setPrice(oc.getPrice());
                                return combo;
                            });
                    }
                    return java.util.stream.Stream.empty();
                })
                .collect(Collectors.toList())
            : List.of();
        
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setPaymentMethod(mapPaymentMethod(order.getPaymentMethod()));
        dto.setItems(items);
        dto.setCombos(combos);
        dto.setVoucherCode(order.getVoucher() != null 
            ? order.getVoucher().getCode() 
            : null);
        return dto;
    }
    
    private String mapRoomType(com.example.backend.entities.enums.RoomType roomType) {
        if (roomType == null) return "STANDARD";
        return roomType.name().replace("TYPE_", "");
    }
    
    private String mapPaymentMethod(com.example.backend.entities.enums.PaymentMethod paymentMethod) {
        if (paymentMethod == null) return null;
        // Map enum to Vietnamese display name
        return switch (paymentMethod) {
            case VNPAY -> "VNPay";
            case MOMO -> "MoMo";
            case ZALOPAY -> "ZaloPay";
            default -> paymentMethod.name();
        };
    }
    
    // ==================== Methods from origin/nhan (for MoMo payment) ====================
    
    public Order save(Order order) {
        return orderRepository.save(order);
    }

    public Optional<Order> findByTxnRef(String txnRef) {
        return orderRepository.findByVnpTxnRef(txnRef);
    }

    public void delete(Order order) {
        orderRepository.delete(order);
    }
}
