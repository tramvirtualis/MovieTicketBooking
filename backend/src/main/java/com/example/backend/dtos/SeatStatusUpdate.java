package com.example.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusUpdate {
    private Long showtimeId;
    private String seatId;
    private String status; // "SELECTED", "DESELECTED", "BOOKED"
    private Set<String> selectedSeats; // All currently selected seats for this showtime
}













