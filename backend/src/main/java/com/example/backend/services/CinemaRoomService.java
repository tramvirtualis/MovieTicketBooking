package com.example.backend.services;

import com.example.backend.dtos.CinemaRoomResponseDTO;
import com.example.backend.dtos.CreateCinemaRoomDTO;
import com.example.backend.dtos.SeatResponseDTO;
import com.example.backend.entities.CinemaComplex;
import com.example.backend.entities.CinemaRoom;
import com.example.backend.entities.Seat;
import com.example.backend.entities.enums.SeatType;
import com.example.backend.repositories.CinemaComplexRepository;
import com.example.backend.repositories.CinemaRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CinemaRoomService {
    
    private final CinemaRoomRepository cinemaRoomRepository;
    private final CinemaComplexRepository cinemaComplexRepository;
    
    @Transactional
    public CinemaRoomResponseDTO createCinemaRoom(CreateCinemaRoomDTO createDTO) {
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
        
        return mapToDTO(savedRoom);
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
    public CinemaRoomResponseDTO updateCinemaRoom(Long roomId, CreateCinemaRoomDTO updateDTO) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + roomId));
        
        // Cập nhật thông tin phòng
        room.setRoomName(updateDTO.getRoomName());
        room.setRoomType(updateDTO.getRoomType());
        
        // Nếu số hàng/cột thay đổi, tạo lại ghế
        if (!room.getSeatLayout().isEmpty()) {
            int currentRows = (int) room.getSeatLayout().stream()
                .map(Seat::getSeatRow)
                .distinct()
                .count();
            int currentCols = (int) room.getSeatLayout().stream()
                .mapToInt(Seat::getSeatColumn)
                .max()
                .orElse(0);
            
            if (currentRows != updateDTO.getRows() || currentCols != updateDTO.getCols()) {
                // Xóa ghế cũ
                room.getSeatLayout().clear();
                // Tạo ghế mới
                List<Seat> newSeats = generateSeats(updateDTO.getRows(), updateDTO.getCols(), room);
                room.setSeatLayout(newSeats);
            }
        } else {
            // Nếu chưa có ghế, tạo mới
            List<Seat> seats = generateSeats(updateDTO.getRows(), updateDTO.getCols(), room);
            room.setSeatLayout(seats);
        }
        
        CinemaRoom savedRoom = cinemaRoomRepository.save(room);
        return mapToDTO(savedRoom);
    }
    
    @Transactional
    public void deleteCinemaRoom(Long roomId) {
        CinemaRoom room = cinemaRoomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chiếu với ID: " + roomId));
        cinemaRoomRepository.delete(room);
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
}

