package com.example.backend.services;

import com.example.backend.dtos.CinemaRoomResponseDTO;
import com.example.backend.dtos.CreateCinemaRoomDTO;
import com.example.backend.dtos.SeatResponseDTO;
import com.example.backend.entities.CinemaComplex;
import com.example.backend.entities.CinemaRoom;
import com.example.backend.entities.Seat;
import com.example.backend.entities.enums.Action;
import com.example.backend.entities.enums.ObjectType;
import com.example.backend.entities.enums.SeatType;
import com.example.backend.repositories.CinemaComplexRepository;
import com.example.backend.repositories.CinemaRoomRepository;
import com.example.backend.repositories.SeatRepository;
import com.example.backend.repositories.TicketRepository;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CinemaRoomService {
    
    private final CinemaRoomRepository cinemaRoomRepository;
    private final CinemaComplexRepository cinemaComplexRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final ActivityLogService activityLogService;
    
    @Transactional
    public CinemaRoomResponseDTO createCinemaRoom(CreateCinemaRoomDTO createDTO, String username) {
        // Tìm CinemaComplex
        CinemaComplex cinemaComplex = cinemaComplexRepository.findById(createDTO.getCinemaComplexId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy cụm rạp với ID: " + createDTO.getCinemaComplexId()));
        
        // Tạo CinemaRoom
        CinemaRoom cinemaRoom = CinemaRoom.builder()
            .roomName(createDTO.getRoomName())
            .roomType(createDTO.getRoomType())
            .cinemaComplex(cinemaComplex)
            .seatLayout(new ArrayList<>())
            .build();
        
        // Lưu CinemaRoom trước (để có roomId)
        CinemaRoom savedRoom = cinemaRoomRepository.save(cinemaRoom);
        
        // Tạo ghế cho phòng chiếu (sau khi đã có roomId)
        List<Seat> seats = generateSeats(createDTO.getRows(), createDTO.getCols(), savedRoom);
        savedRoom.setSeatLayout(seats);
        
        // Lưu lại với ghế (cascade sẽ tự động lưu seats)
        savedRoom = cinemaRoomRepository.save(savedRoom);
        
        CinemaRoomResponseDTO responseDTO = mapToDTO(savedRoom);
        logRoomActivity(username, Action.CREATE, savedRoom, "Tạo phòng chiếu " + responseDTO.getRoomName());
        return responseDTO;
    }
    
    private List<Seat> generateSeats(Integer rows, Integer cols, CinemaRoom cinemaRoom) {
        List<Seat> seats = new ArrayList<>();
        
        for (int row = 0; row < rows; row++) {
            char rowChar = (char) ('A' + row);
            for (int col = 1; col <= cols; col++) {
                Seat seat = Seat.builder()
                    .type(SeatType.NORMAL) // Mặc định là NORMAL, có thể thay đổi sau
                    .seatRow(String.valueOf(rowChar))
                    .seatColumn(col)
                    .cinemaRoom(cinemaRoom)
                    .build();
                seats.add(seat);
            }
        }
        
        return seats;
    }
    
    public List<CinemaRoomResponseDTO> getRoomsByComplexId(Long complexId) {
        List<CinemaRoom> rooms = cinemaRoomRepository.findByCinemaComplexIdWithSeats(complexId);
        return rooms.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public CinemaRoomResponseDTO getRoomById(Long roomId) {
        CinemaRoom room = cinemaRoomRepository.findByIdWithSeats(roomId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + roomId));
        return mapToDTO(room);
    }
    
    @Transactional
    public CinemaRoomResponseDTO updateCinemaRoom(Long roomId, CreateCinemaRoomDTO updateDTO, String username) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + roomId));
        
        // Tính số hàng/cột hiện tại
        int currentRows = 0;
        int currentCols = 0;
        if (!room.getSeatLayout().isEmpty()) {
            currentRows = (int) room.getSeatLayout().stream()
                .map(Seat::getSeatRow)
                .distinct()
                .count();
            currentCols = (int) room.getSeatLayout().stream()
                .mapToInt(Seat::getSeatColumn)
                .max()
                .orElse(0);
        }
        
        // Kiểm tra nếu số hàng/cột thay đổi
        boolean rowsOrColsChanged = currentRows != updateDTO.getRows() || currentCols != updateDTO.getCols();
        
        // Nếu số hàng/cột thay đổi, kiểm tra xem có đặt chỗ không
        if (rowsOrColsChanged) {
            boolean hasBookings = ticketRepository.existsByRoomId(roomId);
            if (hasBookings) {
                throw new RuntimeException("Không thể chỉnh sửa số hàng/cột khi phòng chiếu đã có đặt chỗ");
            }
        }
        
        // Cập nhật thông tin phòng
        room.setRoomName(updateDTO.getRoomName());
        room.setRoomType(updateDTO.getRoomType());
        
        // Nếu số hàng/cột thay đổi, xóa ghế cũ và tạo lại ghế mới
        if (rowsOrColsChanged) {
            // Xóa ghế cũ (clear và xóa trong database)
            if (!room.getSeatLayout().isEmpty()) {
                seatRepository.deleteAll(room.getSeatLayout());
                room.getSeatLayout().clear();
            }
            // Tạo ghế mới
            List<Seat> newSeats = generateSeats(updateDTO.getRows(), updateDTO.getCols(), room);
            room.setSeatLayout(newSeats);
        } else if (room.getSeatLayout().isEmpty()) {
            // Nếu chưa có ghế, tạo mới
            List<Seat> seats = generateSeats(updateDTO.getRows(), updateDTO.getCols(), room);
            room.setSeatLayout(seats);
        }
        
        CinemaRoom savedRoom = cinemaRoomRepository.save(room);
        
        CinemaRoomResponseDTO responseDTO = mapToDTO(savedRoom);
        logRoomActivity(username, Action.UPDATE, savedRoom, "Cập nhật phòng chiếu " + responseDTO.getRoomName());
        return responseDTO;
    }
    
    /**
     * Kiểm tra xem phòng chiếu có đặt chỗ hay không
     * @param roomId ID của phòng chiếu
     * @return true nếu có đặt chỗ, false nếu không
     */
    public boolean hasBookings(Long roomId) {
        return ticketRepository.existsByRoomId(roomId);
    }
    
    @Transactional
    public void deleteCinemaRoom(Long roomId, String username) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + roomId));
        
        cinemaRoomRepository.delete(room);
        logRoomActivity(username, Action.DELETE, room, "Xóa phòng chiếu " + room.getRoomName());
    }
    
    @Transactional
    public SeatResponseDTO updateSeatType(Long seatId, SeatType newType, String username) {
        Seat seat = seatRepository.findById(seatId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy ghế với ID: " + seatId));
        
        seat.setType(newType);
        Seat savedSeat = seatRepository.save(seat);
        
        SeatResponseDTO responseDTO = SeatResponseDTO.builder()
            .seatId(savedSeat.getSeatId())
            .type(savedSeat.getType())
            .seatRow(savedSeat.getSeatRow())
            .seatColumn(savedSeat.getSeatColumn())
            .build();

        logSeatActivity(username, savedSeat, "Cập nhật loại ghế thành " + newType);
        return responseDTO;
    }
    
    private CinemaRoomResponseDTO mapToDTO(CinemaRoom room) {
        List<SeatResponseDTO> seatDTOs = room.getSeatLayout() != null && !room.getSeatLayout().isEmpty()
            ? room.getSeatLayout().stream()
                .map(seat -> SeatResponseDTO.builder()
                    .seatId(seat.getSeatId())
                    .type(seat.getType())
                    .seatRow(seat.getSeatRow())
                    .seatColumn(seat.getSeatColumn())
                    .build())
                .collect(Collectors.toList())
            : new ArrayList<>();
        
        // Tính số hàng và cột từ ghế
        int rows = 0;
        int cols = 0;
        
        if (!seatDTOs.isEmpty()) {
            // Tính số hàng: lấy ký tự lớn nhất (A, B, C...) và chuyển sang số
            rows = seatDTOs.stream()
                .map(SeatResponseDTO::getSeatRow)
                .filter(row -> row != null && !row.isEmpty())
                .mapToInt(row -> row.charAt(0) - 'A' + 1)
                .max()
                .orElse(0);
            
            // Tính số cột: lấy cột lớn nhất
            cols = seatDTOs.stream()
                .map(SeatResponseDTO::getSeatColumn)
                .filter(col -> col != null && col > 0)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(0);
        }
        
        return CinemaRoomResponseDTO.builder()
            .roomId(room.getRoomId())
            .roomName(room.getRoomName())
            .roomType(room.getRoomType())
            .cinemaComplexId(room.getCinemaComplex().getComplexId())
            .cinemaComplexName(room.getCinemaComplex().getName())
            .rows(rows)
            .cols(cols)
            .seats(seatDTOs)
            .build();
    }

    private void logRoomActivity(String username, Action action, CinemaRoom room, String description) {
        if (username == null || username.isBlank() || room == null || room.getRoomId() == null) {
            return;
        }

        try {
            activityLogService.logActivity(
                username,
                action,
                ObjectType.ROOM,
                room.getRoomId(),
                room.getRoomName(),
                description
            );
        } catch (Exception e) {
            log.error("Failed to log room activity: {}", e.getMessage(), e);
        }
    }

    private void logSeatActivity(String username, Seat seat, String description) {
        if (username == null || username.isBlank() || seat == null || seat.getSeatId() == null) {
            return;
        }

        try {
            String seatLabel = seat.getSeatRow() + seat.getSeatColumn();
            activityLogService.logActivity(
                username,
                Action.UPDATE,
                ObjectType.SEAT,
                seat.getSeatId(),
                seatLabel,
                description
            );
        } catch (Exception e) {
            log.error("Failed to log seat activity: {}", e.getMessage(), e);
        }
    }
}

