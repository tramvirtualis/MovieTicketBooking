package com.example.backend.services;

import com.example.backend.dtos.CreateShowtimeDTO;
import com.example.backend.dtos.ShowtimeResponseDTO;
import com.example.backend.dtos.ShowtimeValidationFact;
import com.example.backend.entities.CinemaRoom;
import com.example.backend.entities.Movie;
import com.example.backend.entities.MovieVersion;
import com.example.backend.entities.Seat;
import com.example.backend.entities.Showtime;
import com.example.backend.repositories.CinemaRoomRepository;
import com.example.backend.repositories.MovieRepository;
import com.example.backend.repositories.MovieVersionRepository;
import com.example.backend.repositories.ShowtimeRepository;
import com.example.backend.entities.enums.Action;
import com.example.backend.entities.enums.ObjectType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShowtimeService {
    
    private final ShowtimeRepository showtimeRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final MovieRepository movieRepository;
    private final MovieVersionRepository movieVersionRepository;
    private final KieContainer kieContainer;
    private final ActivityLogService activityLogService;
    
    /**
     * Tìm hoặc tạo MovieVersion dựa trên movie, language và roomType
     */
    @Transactional
    private MovieVersion findOrCreateMovieVersion(Long movieId, com.example.backend.entities.enums.Language language, com.example.backend.entities.enums.RoomType roomType) {
        Movie movie = movieRepository.findById(movieId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + movieId));
        
        // Tìm MovieVersion đã tồn tại
        Optional<MovieVersion> existingVersion = movieVersionRepository.findByMovieAndRoomTypeAndLanguage(movie, roomType, language);
        
        if (existingVersion.isPresent()) {
            return existingVersion.get();
        }
        
        // Nếu chưa có, tạo mới
        MovieVersion newVersion = MovieVersion.builder()
            .movie(movie)
            .roomType(roomType)
            .language(language)
            .build();
        
        return movieVersionRepository.save(newVersion);
    }
    
    /**
     * Tạo lịch chiếu mới
     */
    @Transactional
    public ShowtimeResponseDTO createShowtime(CreateShowtimeDTO createDTO, String username) {
        // Kiểm tra cinemaRoomId khi tạo mới
        if (createDTO.getCinemaRoomId() == null) {
            throw new RuntimeException("Cinema room ID không được để trống khi tạo lịch chiếu mới");
        }
        
        // Tìm CinemaRoom
        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(createDTO.getCinemaRoomId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + createDTO.getCinemaRoomId()));
        
        // Kiểm tra roomType của phòng có khớp với roomType của phim không
        if (cinemaRoom.getRoomType() != createDTO.getRoomType()) {
            throw new RuntimeException("Phòng chiếu " + cinemaRoom.getRoomName() + " là phòng " + 
                cinemaRoom.getRoomType() + ", không thể chiếu phim " + createDTO.getRoomType());
        }
        
        // Tìm hoặc tạo MovieVersion
        MovieVersion movieVersion = findOrCreateMovieVersion(
            createDTO.getMovieId(),
            createDTO.getLanguage(),
            createDTO.getRoomType()
        );
        
        // Kiểm tra xung đột thời gian sử dụng Drools với ràng buộc ngày
        validateShowtimeWithDrools(null, createDTO.getCinemaRoomId(), 
                                   createDTO.getStartTime(), createDTO.getEndTime());
        
        // Tạo Showtime
        Showtime showtime = Showtime.builder()
            .movieVersion(movieVersion)
            .cinemaRoom(cinemaRoom)
            .startTime(createDTO.getStartTime())
            .endTime(createDTO.getEndTime())
            .build();
        
        Showtime savedShowtime = showtimeRepository.save(showtime);
        
        ShowtimeResponseDTO responseDTO = mapToDTO(savedShowtime);
        logShowtimeActivity(
            username,
            Action.CREATE,
            savedShowtime,
            String.format(
                "Tạo lịch chiếu mới cho phim %s tại phòng %s",
                responseDTO.getMovieTitle(),
                responseDTO.getCinemaRoomName()
            )
        );
        return responseDTO;
    }
    
    /**
     * Lấy showtime theo ID (public - không cần đăng nhập)
     */
    @Transactional(readOnly = true)
    public ShowtimeResponseDTO getShowtimeById(Long showtimeId) {
        Showtime showtime = showtimeRepository.findByIdWithRelations(showtimeId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu với ID: " + showtimeId));
        
        return mapToDTO(showtime);
    }
    
    /**
     * Lấy danh sách lịch chiếu theo roomId
     */
    @Transactional(readOnly = true)
    public List<ShowtimeResponseDTO> getShowtimesByRoomId(Long roomId) {
        List<Showtime> showtimes = showtimeRepository.findByCinemaRoom_RoomId(roomId);
        return showtimes.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Cập nhật lịch chiếu
     */
    @Transactional
    public ShowtimeResponseDTO updateShowtime(Long showtimeId, CreateShowtimeDTO updateDTO, String username) {
        Showtime showtime = showtimeRepository.findByIdWithRelations(showtimeId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu với ID: " + showtimeId));
        
        // Lấy roomId hiện tại từ showtime
        Long currentRoomId = showtime.getCinemaRoom().getRoomId();
        Long newRoomId = updateDTO.getCinemaRoomId();
        
        // Nếu có cinemaRoomId mới và khác với hiện tại, cần tìm CinemaRoom mới
        CinemaRoom cinemaRoom = showtime.getCinemaRoom();
        if (newRoomId != null && !currentRoomId.equals(newRoomId)) {
            cinemaRoom = cinemaRoomRepository.findById(newRoomId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + newRoomId));
        }
        
        // Kiểm tra roomType của phòng có khớp với roomType của phim không
        if (cinemaRoom.getRoomType() != updateDTO.getRoomType()) {
            throw new RuntimeException("Phòng chiếu " + cinemaRoom.getRoomName() + " là phòng " + 
                cinemaRoom.getRoomType() + ", không thể chiếu phim " + updateDTO.getRoomType());
        }
        
        // Sử dụng roomId mới nếu có, không thì dùng roomId hiện tại
        Long roomIdToCheck = (newRoomId != null) ? newRoomId : currentRoomId;
        
        // Tìm hoặc tạo MovieVersion mới nếu thay đổi
        MovieVersion movieVersion = findOrCreateMovieVersion(
            updateDTO.getMovieId(),
            updateDTO.getLanguage(),
            updateDTO.getRoomType()
        );
        
        // Kiểm tra xung đột thời gian sử dụng Drools với ràng buộc ngày (loại trừ chính nó)
        validateShowtimeWithDrools(showtimeId, roomIdToCheck, 
                                   updateDTO.getStartTime(), updateDTO.getEndTime());
        
        // Cập nhật thông tin
        showtime.setMovieVersion(movieVersion);
        showtime.setCinemaRoom(cinemaRoom);
        showtime.setStartTime(updateDTO.getStartTime());
        showtime.setEndTime(updateDTO.getEndTime());
        
        Showtime updatedShowtime = showtimeRepository.save(showtime);
        ShowtimeResponseDTO responseDTO = mapToDTO(updatedShowtime);
        logShowtimeActivity(
            username,
            Action.UPDATE,
            updatedShowtime,
            String.format(
                "Cập nhật lịch chiếu của phim %s tại phòng %s",
                responseDTO.getMovieTitle(),
                responseDTO.getCinemaRoomName()
            )
        );
        return responseDTO;
    }
    
    /**
     * Xóa lịch chiếu
     */
    @Transactional
    public void deleteShowtime(Long showtimeId, String username) {
        Showtime showtime = showtimeRepository.findByIdWithRelations(showtimeId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu với ID: " + showtimeId));
        
        // Kiểm tra xem có vé nào đã được đặt chưa
        if (showtime.getTickets() != null && !showtime.getTickets().isEmpty()) {
            throw new RuntimeException("Không thể xóa lịch chiếu đã có vé được đặt");
        }
        
        showtimeRepository.delete(showtime);
        logShowtimeActivity(
            username,
            Action.DELETE,
            showtime,
            String.format(
                "Xóa lịch chiếu của phim %s tại phòng %s",
                showtime.getMovieVersion() != null && showtime.getMovieVersion().getMovie() != null
                    ? showtime.getMovieVersion().getMovie().getTitle()
                    : "Chưa xác định",
                showtime.getCinemaRoom() != null ? showtime.getCinemaRoom().getRoomName() : "Chưa xác định"
            )
        );
    }
    
    /**
     * Kiểm tra xung đột thời gian sử dụng Drools với ràng buộc ngày
     * Chỉ kiểm tra showtimes trong cùng ngày để tối ưu hiệu suất
     */
    private void validateShowtimeWithDrools(Long excludeShowtimeId, Long cinemaRoomId,
                                            java.time.LocalDateTime newStartTime, 
                                            java.time.LocalDateTime newEndTime) {
        // Kiểm tra cơ bản trước khi dùng Drools
        if (newStartTime == null || newEndTime == null) {
            throw new RuntimeException("Thời gian bắt đầu và kết thúc không được để trống");
        }
        
        if (!newStartTime.isBefore(newEndTime)) {
            throw new RuntimeException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }
        
        if (newStartTime.isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Lịch chiếu không được đặt trong quá khứ");
        }
        
        // Lấy ngày của showtime mới
        LocalDate newDate = newStartTime.toLocalDate();
        java.time.LocalDateTime startOfDay = newDate.atStartOfDay();
        java.time.LocalDateTime endOfDay = newDate.plusDays(1).atStartOfDay();
        
        // Chỉ lấy showtimes trong cùng ngày để kiểm tra xung đột (tối ưu)
        List<Showtime> existingShowtimes = showtimeRepository
            .findByCinemaRoom_RoomIdAndDate(cinemaRoomId, startOfDay, endOfDay);
        
        // Tạo KieSession từ KieContainer
        KieSession kieSession = kieContainer.newKieSession();
        
        try {
            // Validate với từng showtime hiện có trong cùng ngày
            for (Showtime existing : existingShowtimes) {
                // Bỏ qua showtime đang được update
                if (excludeShowtimeId != null && existing.getShowtimeId().equals(excludeShowtimeId)) {
                    continue;
                }
                
                // Tạo fact cho Drools
                ShowtimeValidationFact fact = ShowtimeValidationFact.builder()
                    .newShowtimeId(excludeShowtimeId)
                    .cinemaRoomId(cinemaRoomId)
                    .newStartTime(newStartTime)
                    .newEndTime(newEndTime)
                    .newDate(newDate)
                    .existingShowtimeId(existing.getShowtimeId())
                    .existingStartTime(existing.getStartTime())
                    .existingEndTime(existing.getEndTime())
                    .existingDate(existing.getStartTime().toLocalDate())
                    .valid(true) // Mặc định là hợp lệ
                    .build();
                
                // Insert fact vào KieSession
                kieSession.insert(fact);
                
                // Fire rules
                kieSession.fireAllRules();
                
                // Kiểm tra kết quả
                if (!fact.isValid() && fact.getErrorMessage() != null) {
                    throw new RuntimeException(fact.getErrorMessage());
                }
            }
            
            // Validate các ràng buộc chung (thời gian hợp lệ, không trong quá khứ, etc.)
            ShowtimeValidationFact generalFact = ShowtimeValidationFact.builder()
                .newShowtimeId(excludeShowtimeId)
                .cinemaRoomId(cinemaRoomId)
                .newStartTime(newStartTime)
                .newEndTime(newEndTime)
                .newDate(newDate)
                .valid(true)
                .build();
            
            kieSession.insert(generalFact);
            kieSession.fireAllRules();
            
            if (!generalFact.isValid() && generalFact.getErrorMessage() != null) {
                throw new RuntimeException(generalFact.getErrorMessage());
            }
            
        } finally {
            kieSession.dispose();
        }
    }
    
    /**
     * Kiểm tra xung đột thời gian (deprecated - sử dụng Drools thay thế)
     * Giữ lại để tương thích ngược nếu cần
     */
    @Deprecated
    private boolean hasTimeConflict(java.time.LocalDateTime start1, java.time.LocalDateTime end1,
                                   java.time.LocalDateTime start2, java.time.LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
    
    /**
     * Lấy showtimes public theo movieId, province và date
     */
    @Transactional(readOnly = true)
    public List<ShowtimeResponseDTO> getPublicShowtimes(Long movieId, String province, java.time.LocalDate date) {
        System.out.println("=== DEBUG: getPublicShowtimes START ===");
        System.out.println("movieId: " + movieId);
        System.out.println("province: " + province);
        System.out.println("date: " + date);
        
        // First, check if movie exists and has MovieVersions
        try {
            Optional<Movie> movieOpt = movieRepository.findById(movieId);
            if (movieOpt.isPresent()) {
                Movie movie = movieOpt.get();
                System.out.println("Movie found: " + movie.getTitle() + " (ID: " + movie.getMovieId() + ")");
                
                // Check MovieVersions
                List<MovieVersion> versions = movieVersionRepository.findByMovie(movie);
                System.out.println("MovieVersions count: " + versions.size());
                for (MovieVersion mv : versions) {
                    System.out.println("  - MovieVersion ID: " + mv.getMovieVersionId() + 
                        ", RoomType: " + mv.getRoomType() + 
                        ", Language: " + mv.getLanguage());
                    // Count showtimes for this version by querying
                    List<Showtime> versionShowtimes = showtimeRepository.findAll().stream()
                        .filter(st -> st.getMovieVersion() != null && 
                                     st.getMovieVersion().getMovieVersionId().equals(mv.getMovieVersionId()))
                        .collect(Collectors.toList());
                    System.out.println("    Showtimes count for this version: " + versionShowtimes.size());
                    if (!versionShowtimes.isEmpty()) {
                        System.out.println("    First showtime: " + versionShowtimes.get(0).getStartTime());
                    }
                }
            } else {
                System.out.println("ERROR: Movie not found with ID: " + movieId);
            }
        } catch (Exception e) {
            System.err.println("ERROR checking movie and versions: " + e.getMessage());
            e.printStackTrace();
        }
        
        // Test if there are ANY showtimes for this movie
        List<Showtime> allMovieShowtimes = showtimeRepository.findAllByMovieId(movieId);
        System.out.println("Total showtimes for movie " + movieId + " (via query): " + allMovieShowtimes.size());
        if (!allMovieShowtimes.isEmpty()) {
            Showtime first = allMovieShowtimes.get(0);
            System.out.println("First showtime ID: " + first.getShowtimeId());
            System.out.println("First showtime startTime: " + first.getStartTime());
            if (first.getMovieVersion() != null) {
                System.out.println("First showtime movieVersion ID: " + first.getMovieVersion().getMovieVersionId());
                System.out.println("First showtime roomType: " + first.getMovieVersion().getRoomType());
            }
            if (first.getCinemaRoom() != null && first.getCinemaRoom().getCinemaComplex() != null && 
                first.getCinemaRoom().getCinemaComplex().getAddress() != null) {
                System.out.println("First showtime province: " + first.getCinemaRoom().getCinemaComplex().getAddress().getProvince());
            }
        }
        
        java.time.LocalDateTime startOfDay = date.atStartOfDay();
        java.time.LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        System.out.println("startOfDay: " + startOfDay);
        System.out.println("endOfDay: " + endOfDay);
        System.out.println("Current time: " + java.time.LocalDateTime.now());
        
        // Get showtimes for the date (without province filter)
        List<Showtime> allShowtimes = showtimeRepository.findPublicShowtimesWithoutProvince(movieId, startOfDay, endOfDay);
        System.out.println("Showtimes for date " + date + ": " + allShowtimes.size());
        
        // Debug: Log details of each showtime found
        if (!allShowtimes.isEmpty()) {
            System.out.println("=== DEBUG: Showtimes found ===");
            for (int i = 0; i < Math.min(allShowtimes.size(), 5); i++) {
                Showtime st = allShowtimes.get(i);
                System.out.println("Showtime " + (i+1) + ":");
                System.out.println("  - ID: " + st.getShowtimeId());
                System.out.println("  - StartTime: " + st.getStartTime());
                if (st.getMovieVersion() != null) {
                    System.out.println("  - MovieVersion ID: " + st.getMovieVersion().getMovieVersionId());
                    System.out.println("  - RoomType: " + st.getMovieVersion().getRoomType());
                    if (st.getMovieVersion().getMovie() != null) {
                        System.out.println("  - Movie ID: " + st.getMovieVersion().getMovie().getMovieId());
                    }
                } else {
                    System.out.println("  - MovieVersion: NULL!");
                }
                if (st.getCinemaRoom() != null && st.getCinemaRoom().getCinemaComplex() != null) {
                    System.out.println("  - CinemaComplex ID: " + st.getCinemaRoom().getCinemaComplex().getComplexId());
                    System.out.println("  - CinemaComplex Name: " + st.getCinemaRoom().getCinemaComplex().getName());
                    if (st.getCinemaRoom().getCinemaComplex().getAddress() != null) {
                        System.out.println("  - Province: " + st.getCinemaRoom().getCinemaComplex().getAddress().getProvince());
                    }
                }
            }
        }
        
        // Filter by province in Java code for more flexible matching
        // Và đảm bảo roomType của MovieVersion khớp với roomType của CinemaRoom
        List<Showtime> showtimes;
        if (province == null || province.trim().isEmpty()) {
            // Filter chỉ lấy showtimes có roomType khớp
            showtimes = allShowtimes.stream()
                .filter(st -> {
                    if (st.getMovieVersion() != null && st.getCinemaRoom() != null) {
                        return st.getMovieVersion().getRoomType() == st.getCinemaRoom().getRoomType();
                    }
                    return false;
                })
                .collect(Collectors.toList());
            System.out.println("No province filter, using all " + showtimes.size() + " showtimes (after roomType filter)");
        } else {
            String provinceLower = province.trim().toLowerCase();
            System.out.println("Filtering by province: " + provinceLower);
            showtimes = allShowtimes.stream()
                .filter(st -> {
                    // Kiểm tra roomType khớp trước
                    if (st.getMovieVersion() != null && st.getCinemaRoom() != null) {
                        if (st.getMovieVersion().getRoomType() != st.getCinemaRoom().getRoomType()) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                    
                    // Sau đó kiểm tra province
                    if (st.getCinemaRoom() != null && 
                        st.getCinemaRoom().getCinemaComplex() != null &&
                        st.getCinemaRoom().getCinemaComplex().getAddress() != null) {
                        String dbProvince = st.getCinemaRoom().getCinemaComplex().getAddress().getProvince();
                        if (dbProvince != null) {
                            String dbProvinceLower = dbProvince.trim().toLowerCase();
                            boolean matches = dbProvinceLower.equals(provinceLower) || 
                                             dbProvinceLower.contains(provinceLower) ||
                                             provinceLower.contains(dbProvinceLower);
                            if (matches) {
                                System.out.println("Matched province: " + dbProvince + " with " + province);
                            }
                            return matches;
                        }
                    }
                    return false;
                })
                .collect(Collectors.toList());
            System.out.println("After province and roomType filter: " + showtimes.size() + " showtimes");
        }
        
        // Map to DTO and handle any mapping errors
        List<ShowtimeResponseDTO> result = new ArrayList<>();
        for (Showtime st : showtimes) {
            try {
                ShowtimeResponseDTO dto = mapToDTO(st);
                result.add(dto);
                System.out.println("Mapped showtime " + st.getShowtimeId() + " to DTO: " + 
                    "cinemaComplexId=" + dto.getCinemaComplexId() + 
                    ", roomType=" + dto.getRoomType() + 
                    ", startTime=" + dto.getStartTime());
            } catch (Exception e) {
                System.err.println("ERROR mapping showtime " + st.getShowtimeId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Final result count: " + result.size());
        System.out.println("=== DEBUG: getPublicShowtimes END ===");
        
        return result;
    }
    
    /**
     * DEBUG method: Lấy tất cả showtimes theo movieId (không filter gì cả)
     */
    @Transactional(readOnly = true)
    public List<ShowtimeResponseDTO> debugGetAllShowtimesByMovie(Long movieId) {
        List<Showtime> allShowtimes = showtimeRepository.findAllByMovieId(movieId);
        System.out.println("DEBUG: Found " + allShowtimes.size() + " showtimes for movie " + movieId);
        return allShowtimes.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách seatId đã đặt cho showtime
     */
    @Transactional(readOnly = true)
    public List<String> getBookedSeatIds(Long showtimeId) {
        Showtime showtime = showtimeRepository.findByIdWithRelations(showtimeId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu với ID: " + showtimeId));
        
        if (showtime.getTickets() == null || showtime.getTickets().isEmpty()) {
            return new ArrayList<>();
        }
        
        return showtime.getTickets().stream()
            .filter(ticket -> ticket.getSeat() != null)
            .map(ticket -> {
                Seat seat = ticket.getSeat();
                return seat.getSeatRow() + seat.getSeatColumn();
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Map Showtime entity sang DTO
     */
    private ShowtimeResponseDTO mapToDTO(Showtime showtime) {
        MovieVersion movieVersion = showtime.getMovieVersion();
        Movie movie = movieVersion != null ? movieVersion.getMovie() : null;
        CinemaRoom cinemaRoom = showtime.getCinemaRoom();
        com.example.backend.entities.CinemaComplex cinemaComplex = cinemaRoom != null ? cinemaRoom.getCinemaComplex() : null;
        com.example.backend.entities.Address address = cinemaComplex != null ? cinemaComplex.getAddress() : null;
        
        // Validate that required data is loaded
        if (movieVersion == null) {
            throw new RuntimeException("MovieVersion is null for showtime ID: " + showtime.getShowtimeId());
        }
        if (movieVersion.getRoomType() == null) {
            throw new RuntimeException("RoomType is null for showtime ID: " + showtime.getShowtimeId() + ", movieVersion ID: " + movieVersion.getMovieVersionId());
        }
        
        // Đảm bảo roomType được lấy từ MovieVersion
        com.example.backend.entities.enums.RoomType roomType = movieVersion != null ? movieVersion.getRoomType() : null;
        if (roomType == null) {
            throw new RuntimeException("RoomType is null for showtime ID: " + showtime.getShowtimeId() + 
                ", movieVersion ID: " + (movieVersion != null ? movieVersion.getMovieVersionId() : "null"));
        }
        
        return ShowtimeResponseDTO.builder()
            .showtimeId(showtime.getShowtimeId())
            .movieId(movie != null ? movie.getMovieId() : null)
            .movieTitle(movie != null ? movie.getTitle() : null)
            .movieVersionId(movieVersion != null ? movieVersion.getMovieVersionId() : null)
            .language(movieVersion != null ? movieVersion.getLanguage() : null)
            .roomType(roomType)
            .cinemaRoomId(cinemaRoom != null ? cinemaRoom.getRoomId() : null)
            .cinemaRoomName(cinemaRoom != null ? cinemaRoom.getRoomName() : null)
            .cinemaComplexId(cinemaComplex != null ? cinemaComplex.getComplexId() : null)
            .cinemaComplexName(cinemaComplex != null ? cinemaComplex.getName() : null)
            .province(address != null ? address.getProvince() : null)
            .startTime(showtime.getStartTime())
            .endTime(showtime.getEndTime())
            .build();
    }

    private void logShowtimeActivity(String username, Action action, Showtime showtime, String description) {
        if (username == null || username.isBlank()) {
            return;
        }
        if (showtime == null || showtime.getShowtimeId() == null) {
            return;
        }

        try {
            MovieVersion movieVersion = showtime.getMovieVersion();
            Movie movie = movieVersion != null ? movieVersion.getMovie() : null;
            CinemaRoom cinemaRoom = showtime.getCinemaRoom();

            String movieTitle = movie != null ? movie.getTitle() : "Lịch chiếu";
            String roomName = cinemaRoom != null ? cinemaRoom.getRoomName() : "Phòng chiếu";
            java.time.LocalDateTime startTime = showtime.getStartTime();

            String objectName = String.format(
                "%s - %s tại %s",
                movieTitle,
                startTime != null ? startTime.toString() : "Thời gian chưa xác định",
                roomName
            );

            activityLogService.logActivity(
                username,
                action,
                ObjectType.SHOWTIME,
                showtime.getShowtimeId(),
                objectName,
                description
            );
        } catch (Exception e) {
            log.error("Failed to log showtime activity: {}", e.getMessage(), e);
        }
    }
}

