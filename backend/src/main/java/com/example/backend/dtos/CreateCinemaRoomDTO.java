package com.example.backend.dtos;

import com.example.backend.entities.enums.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCinemaRoomDTO {
    @NotBlank(message = "Tên phòng chiếu không được để trống")
    private String roomName;
    
    @NotNull(message = "Loại phòng không được để trống")
    private RoomType roomType;
    
    @NotNull(message = "Cinema complex ID không được để trống")
    private Long cinemaComplexId;
    
    @NotNull(message = "Số hàng ghế không được để trống")
    @Min(value = 1, message = "Số hàng ghế phải lớn hơn 0")
    private Integer rows;
    
    @NotNull(message = "Số cột ghế không được để trống")
    @Min(value = 1, message = "Số cột ghế phải lớn hơn 0")
    private Integer cols;
}

