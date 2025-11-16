package com.example.backend.dtos;

import com.example.backend.entities.enums.Language;
import com.example.backend.entities.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeResponseDTO {
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private Long movieVersionId;
    private Language language;
    private RoomType roomType;
    private Long cinemaRoomId;
    private String cinemaRoomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}

