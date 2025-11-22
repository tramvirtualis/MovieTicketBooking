package com.example.backend.controllers;

import com.example.backend.dtos.SeatSelectionMessage;
import com.example.backend.dtos.SeatStatusUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Controller
@Slf4j
public class SeatWebSocketController {

    // Store temporarily selected seats per showtime
    // Key: showtimeId, Value: Set of seatIds that are currently selected
    private final ConcurrentMap<Long, Set<String>> selectedSeatsByShowtime = new ConcurrentHashMap<>();

    @MessageMapping("/seat/select")
    @SendTo("/topic/seats")
    public SeatStatusUpdate handleSeatSelection(SeatSelectionMessage message) {
        log.info("Received seat selection: showtimeId={}, seatId={}, action={}", 
                message.getShowtimeId(), message.getSeatId(), message.getAction());

        Long showtimeId = message.getShowtimeId();
        String seatId = message.getSeatId();
        
        // Get or create the set of selected seats for this showtime
        Set<String> selectedSeats = selectedSeatsByShowtime.computeIfAbsent(
            showtimeId, 
            k -> ConcurrentHashMap.newKeySet()
        );

        if ("SELECT".equals(message.getAction())) {
            // Add seat to selected set
            selectedSeats.add(seatId);
            log.info("Seat {} selected for showtime {}. Total selected: {}", 
                    seatId, showtimeId, selectedSeats.size());
            
            return new SeatStatusUpdate(
                showtimeId,
                seatId,
                "SELECTED",
                Set.copyOf(selectedSeats) // Return a copy to avoid external modification
            );
        } else if ("DESELECT".equals(message.getAction())) {
            // Remove seat from selected set
            selectedSeats.remove(seatId);
            log.info("Seat {} deselected for showtime {}. Total selected: {}", 
                    seatId, showtimeId, selectedSeats.size());
            
            return new SeatStatusUpdate(
                showtimeId,
                seatId,
                "DESELECTED",
                Set.copyOf(selectedSeats)
            );
        }

        return new SeatStatusUpdate(showtimeId, seatId, "UNKNOWN", Set.of());
    }

    // Method to clear selected seats when booking is confirmed
    public void clearSelectedSeats(Long showtimeId, Set<String> bookedSeatIds) {
        Set<String> selectedSeats = selectedSeatsByShowtime.get(showtimeId);
        if (selectedSeats != null) {
            selectedSeats.removeAll(bookedSeatIds);
            log.info("Cleared booked seats {} for showtime {}", bookedSeatIds, showtimeId);
        }
    }
}













