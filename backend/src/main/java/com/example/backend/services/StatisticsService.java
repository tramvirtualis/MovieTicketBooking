package com.example.backend.services;

import com.example.backend.entities.Order;
import com.example.backend.entities.Ticket;
import com.example.backend.entities.enums.MovieStatus;
import com.example.backend.repositories.CustomerRepository;
import com.example.backend.repositories.MovieRepository;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.TicketRepository;
import com.example.backend.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final MovieRepository movieRepository;
    private final CustomerRepository customerRepository;
    private final VoucherRepository voucherRepository;

    /**
     * Lấy tổng doanh thu từ tất cả các đơn hàng đã thanh toán (có vnpPayDate)
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenue() {
        try {
            BigDecimal total = orderRepository.findAll().stream()
                    .filter(order -> order.getTotalAmount() != null && order.getVnpPayDate() != null)
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            log.info("Total revenue calculated: {}", total);
            return total != null ? total : BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("Error calculating total revenue: {}", e.getMessage(), e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * Đếm tổng số vé đã bán (tổng số hàng trong bảng tickets từ các orders đã thanh toán)
     */
    @Transactional(readOnly = true)
    public Long getTotalTicketsSold() {
        try {
            // Chỉ đếm tickets từ các orders đã thanh toán (có vnpPayDate)
            long count = orderRepository.findAll().stream()
                    .filter(order -> order.getVnpPayDate() != null && order.getTickets() != null)
                    .mapToLong(order -> order.getTickets().size())
                    .sum();
            log.info("Total tickets sold: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error counting tickets: {}", e.getMessage(), e);
            return 0L;
        }
    }

    /**
     * Đếm số phim đang chiếu (status = NOW_SHOWING)
     */
    @Transactional(readOnly = true)
    public Long getActiveMoviesCount() {
        try {
            long count = movieRepository.findByStatus(MovieStatus.NOW_SHOWING).size();
            log.info("Active movies count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error counting active movies: {}", e.getMessage(), e);
            return 0L;
        }
    }

    /**
     * Đếm số khách hàng không bị blocked (status = true)
     */
    @Transactional(readOnly = true)
    public Long getActiveCustomersCount() {
        try {
            long count = customerRepository.findAll().stream()
                    .filter(customer -> customer.getStatus() != null && customer.getStatus())
                    .count();
            log.info("Active customers count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error counting active customers: {}", e.getMessage(), e);
            return 0L;
        }
    }

    /**
     * Đếm số voucher đang hoạt động (trong khoảng thời gian startDate và endDate)
     */
    @Transactional(readOnly = true)
    public Long getActiveVouchersCount() {
        try {
            LocalDateTime now = LocalDateTime.now();
            long count = voucherRepository.findAll().stream()
                    .filter(voucher -> {
                        if (voucher.getStartDate() == null || voucher.getEndDate() == null) {
                            return false;
                        }
                        return !now.isBefore(voucher.getStartDate()) && !now.isAfter(voucher.getEndDate());
                    })
                    .count();
            log.info("Active vouchers count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error counting active vouchers: {}", e.getMessage(), e);
            return 0L;
        }
    }

    /**
     * Lấy tất cả các thống kê cùng lúc
     */
    @Transactional(readOnly = true)
    public StatisticsDTO getAllStatistics() {
        return StatisticsDTO.builder()
                .totalRevenue(getTotalRevenue())
                .totalTicketsSold(getTotalTicketsSold())
                .activeMoviesCount(getActiveMoviesCount())
                .activeCustomersCount(getActiveCustomersCount())
                .activeVouchersCount(getActiveVouchersCount())
                .build();
    }

    /**
     * Lấy doanh thu và tổng vé bán ra theo rạp (cinema complex)
     * @return Map với key là complexId, value là CinemaStatisticsDTO
     */
    @Transactional(readOnly = true)
    public Map<Long, CinemaStatisticsDTO> getStatisticsByCinema() {
        try {
            Map<Long, CinemaStatisticsDTO> cinemaStats = new HashMap<>();
            
            // Lấy tất cả orders đã thanh toán
            List<Order> paidOrders = orderRepository.findAll().stream()
                    .filter(order -> order.getVnpPayDate() != null && order.getTickets() != null)
                    .collect(Collectors.toList());
            
            // Duyệt qua từng order và tickets
            for (Order order : paidOrders) {
                BigDecimal orderAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                
                // Group tickets by cinema complex để tránh double counting
                Map<Long, Long> ticketsByCinema = new HashMap<>();
                
                for (Ticket ticket : order.getTickets()) {
                    if (ticket.getShowtime() != null 
                            && ticket.getShowtime().getCinemaRoom() != null
                            && ticket.getShowtime().getCinemaRoom().getCinemaComplex() != null) {
                        Long complexId = ticket.getShowtime().getCinemaRoom().getCinemaComplex().getComplexId();
                        ticketsByCinema.put(complexId, ticketsByCinema.getOrDefault(complexId, 0L) + 1);
                    }
                }
                
                // Phân bổ doanh thu theo số vé của mỗi rạp trong order
                long totalTicketsInOrder = order.getTickets().size();
                if (totalTicketsInOrder > 0) {
                    for (Map.Entry<Long, Long> entry : ticketsByCinema.entrySet()) {
                        Long complexId = entry.getKey();
                        Long ticketCount = entry.getValue();
                        
                        // Tính doanh thu cho rạp này = (ticketCount / totalTickets) * orderAmount
                        BigDecimal cinemaRevenue = orderAmount
                                .multiply(BigDecimal.valueOf(ticketCount))
                                .divide(BigDecimal.valueOf(totalTicketsInOrder), 2, RoundingMode.HALF_UP);
                        
                        if (!cinemaStats.containsKey(complexId)) {
                            String cinemaName = order.getTickets().stream()
                                    .filter(t -> t.getShowtime() != null 
                                            && t.getShowtime().getCinemaRoom() != null
                                            && t.getShowtime().getCinemaRoom().getCinemaComplex() != null
                                            && t.getShowtime().getCinemaRoom().getCinemaComplex().getComplexId().equals(complexId))
                                    .findFirst()
                                    .map(t -> t.getShowtime().getCinemaRoom().getCinemaComplex().getName())
                                    .orElse("Rạp #" + complexId);
                            
                            cinemaStats.put(complexId, CinemaStatisticsDTO.builder()
                                    .id(complexId)
                                    .name(cinemaName)
                                    .revenue(BigDecimal.ZERO)
                                    .ticketsSold(0L)
                                    .build());
                        }
                        
                        CinemaStatisticsDTO stats = cinemaStats.get(complexId);
                        stats.setRevenue(stats.getRevenue().add(cinemaRevenue));
                        stats.setTicketsSold(stats.getTicketsSold() + ticketCount);
                    }
                }
            }
            
            log.info("Statistics by cinema calculated: {} cinemas", cinemaStats.size());
            return cinemaStats;
        } catch (Exception e) {
            log.error("Error calculating statistics by cinema: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    /**
     * Lấy doanh thu và tổng vé bán ra theo phim
     * @return Map với key là movieId, value là MovieStatisticsDTO
     */
    @Transactional(readOnly = true)
    public Map<Long, MovieStatisticsDTO> getStatisticsByMovie() {
        try {
            Map<Long, MovieStatisticsDTO> movieStats = new HashMap<>();
            
            // Lấy tất cả orders đã thanh toán
            List<Order> paidOrders = orderRepository.findAll().stream()
                    .filter(order -> order.getVnpPayDate() != null && order.getTickets() != null)
                    .collect(Collectors.toList());
            
            // Duyệt qua từng order và tickets
            for (Order order : paidOrders) {
                BigDecimal orderAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                
                // Group tickets by movie để tránh double counting
                Map<Long, Long> ticketsByMovie = new HashMap<>();
                
                for (Ticket ticket : order.getTickets()) {
                    if (ticket.getShowtime() != null 
                            && ticket.getShowtime().getMovieVersion() != null
                            && ticket.getShowtime().getMovieVersion().getMovie() != null) {
                        Long movieId = ticket.getShowtime().getMovieVersion().getMovie().getMovieId();
                        ticketsByMovie.put(movieId, ticketsByMovie.getOrDefault(movieId, 0L) + 1);
                    }
                }
                
                // Phân bổ doanh thu theo số vé của mỗi phim trong order
                long totalTicketsInOrder = order.getTickets().size();
                if (totalTicketsInOrder > 0) {
                    for (Map.Entry<Long, Long> entry : ticketsByMovie.entrySet()) {
                        Long movieId = entry.getKey();
                        Long ticketCount = entry.getValue();
                        
                        // Tính doanh thu cho phim này = (ticketCount / totalTickets) * orderAmount
                        BigDecimal movieRevenue = orderAmount
                                .multiply(BigDecimal.valueOf(ticketCount))
                                .divide(BigDecimal.valueOf(totalTicketsInOrder), 2, RoundingMode.HALF_UP);
                        
                        if (!movieStats.containsKey(movieId)) {
                            String movieTitle = order.getTickets().stream()
                                    .filter(t -> t.getShowtime() != null 
                                            && t.getShowtime().getMovieVersion() != null
                                            && t.getShowtime().getMovieVersion().getMovie() != null
                                            && t.getShowtime().getMovieVersion().getMovie().getMovieId().equals(movieId))
                                    .findFirst()
                                    .map(t -> t.getShowtime().getMovieVersion().getMovie().getTitle())
                                    .orElse("Phim #" + movieId);
                            
                            movieStats.put(movieId, MovieStatisticsDTO.builder()
                                    .id(movieId)
                                    .title(movieTitle)
                                    .revenue(BigDecimal.ZERO)
                                    .ticketsSold(0L)
                                    .build());
                        }
                        
                        MovieStatisticsDTO stats = movieStats.get(movieId);
                        stats.setRevenue(stats.getRevenue().add(movieRevenue));
                        stats.setTicketsSold(stats.getTicketsSold() + ticketCount);
                    }
                }
            }
            
            log.info("Statistics by movie calculated: {} movies", movieStats.size());
            return movieStats;
        } catch (Exception e) {
            log.error("Error calculating statistics by movie: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    /**
     * Lấy doanh thu và tổng vé bán ra cho một rạp cụ thể
     */
    @Transactional(readOnly = true)
    public CinemaStatisticsDTO getStatisticsByCinemaId(Long complexId) {
        Map<Long, CinemaStatisticsDTO> allStats = getStatisticsByCinema();
        return allStats.getOrDefault(complexId, CinemaStatisticsDTO.builder()
                .id(complexId)
                .name("Rạp #" + complexId)
                .revenue(BigDecimal.ZERO)
                .ticketsSold(0L)
                .build());
    }

    /**
     * Lấy doanh thu và tổng vé bán ra cho một phim cụ thể
     */
    @Transactional(readOnly = true)
    public MovieStatisticsDTO getStatisticsByMovieId(Long movieId) {
        Map<Long, MovieStatisticsDTO> allStats = getStatisticsByMovie();
        return allStats.getOrDefault(movieId, MovieStatisticsDTO.builder()
                .id(movieId)
                .title("Phim #" + movieId)
                .revenue(BigDecimal.ZERO)
                .ticketsSold(0L)
                .build());
    }

    // DTO class for statistics response
    @lombok.Data
    @lombok.Builder
    public static class StatisticsDTO {
        private BigDecimal totalRevenue;
        private Long totalTicketsSold;
        private Long activeMoviesCount;
        private Long activeCustomersCount;
        private Long activeVouchersCount;
    }

    // DTO class for cinema statistics
    @lombok.Data
    @lombok.Builder
    public static class CinemaStatisticsDTO {
        private Long id;
        private String name;
        private BigDecimal revenue;
        private Long ticketsSold;
    }

    // DTO class for movie statistics
    @lombok.Data
    @lombok.Builder
    public static class MovieStatisticsDTO {
        private Long id;
        private String title;
        private BigDecimal revenue;
        private Long ticketsSold;
    }
}

