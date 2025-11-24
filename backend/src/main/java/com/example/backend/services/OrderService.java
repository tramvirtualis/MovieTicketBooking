package com.example.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dtos.OrderComboDTO;
import com.example.backend.dtos.OrderItemDTO;
import com.example.backend.dtos.OrderResponseDTO;
import com.example.backend.dtos.PriceDTO;
import com.example.backend.entities.CinemaComplex;
import com.example.backend.entities.CinemaRoom;
import com.example.backend.entities.Movie;
import com.example.backend.entities.MovieVersion;
import com.example.backend.entities.Order;
import com.example.backend.entities.Seat;
import com.example.backend.entities.Showtime;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.entities.enums.SeatType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import com.example.backend.entities.enums.PaymentMethod;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final PriceService priceService;
    private final MomoService momoService;
    // private final NotificationService notificationService; // Tránh circular dep nếu notificationService cần OrderService
    
    // ==================== Methods from HEAD (for getting orders) ====================
    
    @Transactional
    public List<OrderResponseDTO> getOrdersByUser(Long userId) {
        List<Order> orders = orderRepository.findByUserUserIdWithDetails(userId);
        System.out.println("Found " + orders.size() + " total orders for user " + userId);
        
        // Self-healing: Check MoMo status for pending orders
        for (Order order : orders) {
            if (order.getVnpPayDate() == null && order.getPaymentMethod() == PaymentMethod.MOMO) {
                try {
                    System.out.println("Self-healing: Checking MoMo status for pending order " + order.getOrderId());
                    Map<String, Object> response = momoService.queryTransaction(order.getVnpTxnRef());
                    if (response != null) {
                        Object resultCodeObj = response.get("resultCode");
                        int resultCode = resultCodeObj != null ? Integer.parseInt(resultCodeObj.toString()) : -1;
                        
                        System.out.println("Self-healing: MoMo Check for Order " + order.getOrderId() + " (" + order.getVnpTxnRef() + ") returned resultCode: " + resultCode);
                        
                        if (resultCode == 0) {
                            System.out.println("Self-healing: MoMo confirmed SUCCESS. Updating order " + order.getOrderId());
                            order.setVnpPayDate(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")));
                            
                            String transId = (String) response.get("transId");
                            if (transId != null) order.setVnpTransactionNo(transId);
                            
                            orderRepository.save(order);
                            // Không gửi notification/email ở đây để tránh duplicate và circular dependency
                            // Chỉ cần update DB để hiển thị trong history
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Self-healing failed for order " + order.getOrderId() + ": " + e.getMessage());
                }
            }
        }
        
        List<OrderResponseDTO> result = orders.stream()
            // Chỉ lấy các order đã thanh toán thành công (có vnpPayDate)
            .filter(order -> {
                boolean isPaid = order.getVnpPayDate() != null;
                if (!isPaid) {
                    System.out.println("Filtering out unpaid order ID: " + order.getOrderId());
                }
                return isPaid;
            })
            .map(this::mapToDTO)
            .collect(Collectors.toList());
            
        System.out.println("Returning " + result.size() + " paid orders");
        return result;
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAllWithDetails();
        return orders.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByComplexId(Long complexId) {
        List<Order> orders = orderRepository.findByCinemaComplexIdWithDetails(complexId);
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
                item.setShowtimeId(showtime.getShowtimeId());
                item.setShowtimeStart(showtime.getStartTime());
                item.setShowtimeEnd(showtime.getEndTime());
                item.setSeatId(seat.getSeatRow() + seat.getSeatColumn());
                item.setSeatRow(seat.getSeatRow());
                item.setSeatColumn(seat.getSeatColumn());
                item.setPrice(ticket.getPrice());
                
                // Calculate basePrice - lấy giá gốc từ database dựa trên roomType + seatType
                try {
                    PriceDTO priceDTO = priceService.getPriceByRoomTypeAndSeatType(
                        movieVersion.getRoomType(),
                        seat.getType()
                    );
                    
                    if (priceDTO != null) {
                        java.math.BigDecimal basePrice = priceDTO.getPrice();
                        item.setBasePrice(basePrice);
                    } else {
                        // Nếu không tìm thấy giá trong database, giả sử giá hiện tại là basePrice
                        item.setBasePrice(ticket.getPrice());
                    }
                } catch (Exception e) {
                    // Nếu có lỗi, sử dụng giá hiện tại
                    item.setBasePrice(ticket.getPrice());
                }
                
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
        // Set user info
        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getUserId());
            dto.setUserEmail(order.getUser().getEmail());
            dto.setUserPhone(order.getUser().getPhone());
            // Get user name if Customer
            if (order.getUser() instanceof com.example.backend.entities.Customer) {
                com.example.backend.entities.Customer customer = (com.example.backend.entities.Customer) order.getUser();
                dto.setUserName(customer.getName());
            } else {
                dto.setUserName(order.getUser().getUsername());
            }
        }
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
    
    /**
     * Lấy thống kê chi tiêu của user
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getExpenseStatistics(Long userId) {
        List<Order> orders = orderRepository.findByUserUserIdWithDetails(userId);
        
        System.out.println("DEBUG: Total orders found for user " + userId + ": " + orders.size());
        
        // Chỉ tính các orders đã thanh toán thành công (có vnpPayDate)
        List<Order> paidOrders = orders.stream()
            .filter(order -> {
                boolean isPaid = order.getVnpPayDate() != null;
                if (!isPaid) {
                    System.out.println("DEBUG: Order " + order.getOrderId() + " not paid (vnpPayDate is null)");
                }
                return isPaid;
            })
            .collect(Collectors.toList());
        
        System.out.println("DEBUG: Paid orders count: " + paidOrders.size());
        
        // Tính tổng chi tiêu
        BigDecimal totalSpent = paidOrders.stream()
            .map(order -> {
                BigDecimal amount = order.getTotalAmount();
                System.out.println("DEBUG: Order " + order.getOrderId() + " amount: " + amount);
                return amount;
            })
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        System.out.println("DEBUG: Total spent: " + totalSpent);
        
        // Đếm tổng số vé (tổng số tickets)
        long totalTickets = paidOrders.stream()
            .mapToLong(order -> {
                long ticketCount = order.getTickets() != null ? order.getTickets().size() : 0;
                System.out.println("DEBUG: Order " + order.getOrderId() + " ticket count: " + ticketCount);
                return ticketCount;
            })
            .sum();
        
        System.out.println("DEBUG: Total tickets: " + totalTickets);
        
        // Tính chi tiêu trung bình/vé
        BigDecimal averagePerTicket = totalTickets > 0 
            ? totalSpent.divide(BigDecimal.valueOf(totalTickets), 2, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        
        // Tính chi tiêu theo tháng
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth lastMonth = currentMonth.minusMonths(1);
        YearMonth threeMonthsAgo = currentMonth.minusMonths(3);
        
        LocalDate currentMonthStart = currentMonth.atDay(1);
        LocalDate currentMonthEnd = currentMonth.atEndOfMonth();
        LocalDate lastMonthStart = lastMonth.atDay(1);
        LocalDate lastMonthEnd = lastMonth.atEndOfMonth();
        LocalDate threeMonthsAgoStart = threeMonthsAgo.atDay(1);
        
        BigDecimal thisMonthSpent = paidOrders.stream()
            .filter(order -> {
                if (order.getOrderDate() == null) return false;
                LocalDate orderDate = order.getOrderDate().toLocalDate();
                return !orderDate.isBefore(currentMonthStart) && !orderDate.isAfter(currentMonthEnd);
            })
            .map(Order::getTotalAmount)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal lastMonthSpent = paidOrders.stream()
            .filter(order -> {
                if (order.getOrderDate() == null) return false;
                LocalDate orderDate = order.getOrderDate().toLocalDate();
                return !orderDate.isBefore(lastMonthStart) && !orderDate.isAfter(lastMonthEnd);
            })
            .map(Order::getTotalAmount)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal lastThreeMonthsSpent = paidOrders.stream()
            .filter(order -> {
                if (order.getOrderDate() == null) return false;
                LocalDate orderDate = order.getOrderDate().toLocalDate();
                return !orderDate.isBefore(threeMonthsAgoStart);
            })
            .map(Order::getTotalAmount)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Đếm tổng số đơn hàng đã thanh toán
        long totalOrders = paidOrders.size();
        
        System.out.println("DEBUG: Total orders: " + totalOrders);
        System.out.println("DEBUG: This month spent: " + thisMonthSpent);
        System.out.println("DEBUG: Last month spent: " + lastMonthSpent);
        System.out.println("DEBUG: Last 3 months spent: " + lastThreeMonthsSpent);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalSpent", totalSpent);
        statistics.put("totalTickets", totalTickets);
        statistics.put("totalOrders", totalOrders);
        statistics.put("thisMonthSpent", thisMonthSpent);
        statistics.put("lastMonthSpent", lastMonthSpent);
        statistics.put("lastThreeMonthsSpent", lastThreeMonthsSpent);
        
        System.out.println("DEBUG: Returning statistics map: " + statistics);
        System.out.println("DEBUG: Statistics values - totalSpent: " + totalSpent + " (type: " + totalSpent.getClass().getName() + ")");
        
        return statistics;
    }
    
    /**
     * Update vnpPayDate cho các orders cũ (những orders đã có data nhưng chưa có vnpPayDate)
     * Chỉ update các orders thực sự đã hoàn thành (có tickets hoặc orderCombos)
     */
    @Transactional
    public Map<String, Object> updateOldOrdersPayDate() {
        log.info("Starting to update vnpPayDate for old orders...");
        
        // Lấy tất cả orders chưa có vnpPayDate
        List<Order> ordersWithoutPayDate = orderRepository.findAll().stream()
            .filter(order -> order.getVnpPayDate() == null)
            .filter(order -> {
                // Chỉ update các orders có tickets hoặc orderCombos (tức là orders thực sự đã hoàn thành)
                boolean hasTickets = order.getTickets() != null && !order.getTickets().isEmpty();
                boolean hasCombos = order.getOrderCombos() != null && !order.getOrderCombos().isEmpty();
                return hasTickets || hasCombos;
            })
            .collect(Collectors.toList());
        
        log.info("Found {} orders without vnpPayDate (but have tickets/combos)", ordersWithoutPayDate.size());
        
        int updatedCount = 0;
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        
        for (Order order : ordersWithoutPayDate) {
            // Set vnpPayDate = orderDate (thời điểm order được tạo)
            // Hoặc nếu orderDate null thì dùng thời điểm hiện tại
            LocalDateTime payDate = order.getOrderDate() != null ? order.getOrderDate() : now;
            order.setVnpPayDate(payDate);
            orderRepository.save(order);
            updatedCount++;
            log.info("Updated Order ID: {} - set vnpPayDate to {}", order.getOrderId(), payDate);
        }
        
        log.info("Successfully updated {} orders", updatedCount);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalFound", ordersWithoutPayDate.size());
        result.put("updated", updatedCount);
        result.put("message", "Đã cập nhật " + updatedCount + " đơn hàng");
        
        return result;
    }
}
