package com.example.backend.services;

import com.example.backend.dtos.CreateShowtimeDTO;
import com.example.backend.dtos.ShowtimeResponseDTO;
import com.example.backend.entities.CinemaRoom;
import com.example.backend.entities.Movie;
import com.example.backend.entities.MovieVersion;
import com.example.backend.entities.Showtime;
import com.example.backend.repositories.CinemaRoomRepository;
import com.example.backend.repositories.MovieRepository;
import com.example.backend.repositories.MovieVersionRepository;
import com.example.backend.repositories.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeService {
    
    private final ShowtimeRepository showtimeRepository;
    private final CinemaRoomRepository cinemaRoomRepository;
    private final MovieRepository movieRepository;
    private final MovieVersionRepository movieVersionRepository;
    
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
    public ShowtimeResponseDTO createShowtime(CreateShowtimeDTO createDTO) {
        // Kiểm tra cinemaRoomId khi tạo mới
        if (createDTO.getCinemaRoomId() == null) {
            throw new RuntimeException("Cinema room ID không được để trống khi tạo lịch chiếu mới");
        }
        
        // Tìm CinemaRoom
        CinemaRoom cinemaRoom = cinemaRoomRepository.findById(createDTO.getCinemaRoomId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + createDTO.getCinemaRoomId()));
        
        // Tìm hoặc tạo MovieVersion
        MovieVersion movieVersion = findOrCreateMovieVersion(
            createDTO.getMovieId(),
            createDTO.getLanguage(),
            createDTO.getRoomType()
        );
        
        // Kiểm tra xung đột thời gian
        List<Showtime> existingShowtimes = showtimeRepository.findByCinemaRoom_RoomId(createDTO.getCinemaRoomId());
        for (Showtime existing : existingShowtimes) {
            if (hasTimeConflict(existing.getStartTime(), existing.getEndTime(), 
                               createDTO.getStartTime(), createDTO.getEndTime())) {
                throw new RuntimeException("Khung giờ này trùng với lịch chiếu khác trong phòng");
            }
        }
        
        // Tạo Showtime
        Showtime showtime = Showtime.builder()
            .movieVersion(movieVersion)
            .cinemaRoom(cinemaRoom)
            .startTime(createDTO.getStartTime())
            .endTime(createDTO.getEndTime())
            .build();
        
        Showtime savedShowtime = showtimeRepository.save(showtime);
        
        return mapToDTO(savedShowtime);
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
    public ShowtimeResponseDTO updateShowtime(Long showtimeId, CreateShowtimeDTO updateDTO) {
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
        
        // Sử dụng roomId mới nếu có, không thì dùng roomId hiện tại
        Long roomIdToCheck = (newRoomId != null) ? newRoomId : currentRoomId;
        
        // Tìm hoặc tạo MovieVersion mới nếu thay đổi
        MovieVersion movieVersion = findOrCreateMovieVersion(
            updateDTO.getMovieId(),
            updateDTO.getLanguage(),
            updateDTO.getRoomType()
        );
        
        // Kiểm tra xung đột thời gian (loại trừ chính nó)
        List<Showtime> existingShowtimes = showtimeRepository.findByCinemaRoom_RoomId(roomIdToCheck);
        for (Showtime existing : existingShowtimes) {
            if (!existing.getShowtimeId().equals(showtimeId) &&
                hasTimeConflict(existing.getStartTime(), existing.getEndTime(), 
                               updateDTO.getStartTime(), updateDTO.getEndTime())) {
                throw new RuntimeException("Khung giờ này trùng với lịch chiếu khác trong phòng");
            }
        }
        
        // Cập nhật thông tin
        showtime.setMovieVersion(movieVersion);
        showtime.setCinemaRoom(cinemaRoom);
        showtime.setStartTime(updateDTO.getStartTime());
        showtime.setEndTime(updateDTO.getEndTime());
        
        Showtime updatedShowtime = showtimeRepository.save(showtime);
        
        return mapToDTO(updatedShowtime);
    }
    
    /**
     * Xóa lịch chiếu
     */
    @Transactional
    public void deleteShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findByIdWithRelations(showtimeId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch chiếu với ID: " + showtimeId));
        
        // Kiểm tra xem có vé nào đã được đặt chưa
        if (showtime.getTickets() != null && !showtime.getTickets().isEmpty()) {
            throw new RuntimeException("Không thể xóa lịch chiếu đã có vé được đặt");
        }
        
        showtimeRepository.delete(showtime);
    }
    
    /**
     * Kiểm tra xung đột thời gian
     */
    private boolean hasTimeConflict(java.time.LocalDateTime start1, java.time.LocalDateTime end1,
                                   java.time.LocalDateTime start2, java.time.LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
    
    /**
     * Map Showtime entity sang DTO
     */
    private ShowtimeResponseDTO mapToDTO(Showtime showtime) {
        MovieVersion movieVersion = showtime.getMovieVersion();
        Movie movie = movieVersion != null ? movieVersion.getMovie() : null;
        CinemaRoom cinemaRoom = showtime.getCinemaRoom();
        
        return ShowtimeResponseDTO.builder()
            .showtimeId(showtime.getShowtimeId())
            .movieId(movie != null ? movie.getMovieId() : null)
            .movieTitle(movie != null ? movie.getTitle() : null)
            .movieVersionId(movieVersion != null ? movieVersion.getMovieVersionId() : null)
            .language(movieVersion != null ? movieVersion.getLanguage() : null)
            .roomType(movieVersion != null ? movieVersion.getRoomType() : null)
            .cinemaRoomId(cinemaRoom != null ? cinemaRoom.getRoomId() : null)
            .cinemaRoomName(cinemaRoom != null ? cinemaRoom.getRoomName() : null)
            .startTime(showtime.getStartTime())
            .endTime(showtime.getEndTime())
            .build();
    }
}

