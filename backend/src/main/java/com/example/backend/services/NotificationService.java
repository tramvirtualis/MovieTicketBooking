package com.example.backend.services;

import com.example.backend.dtos.NotificationDTO;
import com.example.backend.entities.Notification;
import com.example.backend.entities.User;
import com.example.backend.repositories.NotificationRepository;
import com.example.backend.repositories.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * Gửi thông báo đến một user cụ thể
     * Lưu vào database và gửi qua WebSocket
     * @param userId ID của user
     * @param notification Notification DTO
     */
    @Transactional
    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            
            // Lưu vào database
            String dataJson = null;
            if (notification.getData() != null) {
                try {
                    dataJson = objectMapper.writeValueAsString(notification.getData());
                } catch (JsonProcessingException e) {
                    log.warn("Failed to serialize notification data: {}", e.getMessage());
                }
            }
            
            Notification notificationEntity = Notification.builder()
                    .user(user)
                    .type(notification.getType())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .timestamp(notification.getTimestamp() != null ? notification.getTimestamp() : LocalDateTime.now())
                    .data(dataJson)
                    .isRead(false)
                    .build();
            
            Notification savedNotification = notificationRepository.save(notificationEntity);
            log.info("Notification saved to database for user {}: {}", userId, notification.getType());
            
            // Cập nhật notification DTO với ID từ database
            notification.setNotificationId(savedNotification.getNotificationId());
            notification.setIsRead(false);
            
            // Gửi qua WebSocket
            String destination = "/queue/notifications/" + userId;
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Notification sent via WebSocket to user {}: {}", userId, notification.getType());
        } catch (Exception e) {
            log.error("Error sending notification to user {}: {}", userId, e.getMessage(), e);
        }
    }
    
    /**
     * Lấy tất cả thông báo của user
     */
    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        List<Notification> notifications = notificationRepository.findByUserOrderByTimestampDesc(user);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy số lượng thông báo chưa đọc
     */
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return notificationRepository.countUnreadByUser(user);
    }
    
    /**
     * Đánh dấu thông báo đã đọc
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Notification does not belong to user");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    /**
     * Đánh dấu tất cả thông báo đã đọc
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        notificationRepository.markAllAsReadByUser(user);
    }
    
    /**
     * Xóa thông báo
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Notification does not belong to user");
        }
        
        notificationRepository.delete(notification);
    }
    
    /**
     * Convert Notification entity sang DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        Object data = null;
        if (notification.getData() != null) {
            try {
                data = objectMapper.readValue(notification.getData(), Object.class);
            } catch (JsonProcessingException e) {
                log.warn("Failed to deserialize notification data: {}", e.getMessage());
            }
        }
        
        return NotificationDTO.builder()
                .notificationId(notification.getNotificationId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .timestamp(notification.getTimestamp())
                .data(data)
                .isRead(notification.getIsRead())
                .build();
    }

    /**
     * Gửi thông báo đánh giá phim thành công
     */
    public void notifyReviewSuccess(Long userId, String movieTitle) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("REVIEW_SUCCESS")
                .title("Đánh giá thành công")
                .message("Bạn đã đánh giá phim \"" + movieTitle + "\" thành công!")
                .timestamp(LocalDateTime.now())
                .build();
        sendNotificationToUser(userId, notification);
    }

    /**
     * Gửi thông báo voucher đã được tăng (admin assign voucher)
     */
    public void notifyVoucherAdded(Long userId, String voucherCode, String voucherName) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("VOUCHER_ADDED")
                .title("Voucher mới")
                .message("Bạn đã nhận được voucher mới: " + voucherName + " (Mã: " + voucherCode + ")")
                .timestamp(LocalDateTime.now())
                .data(java.util.Map.of("voucherCode", voucherCode, "voucherName", voucherName))
                .build();
        sendNotificationToUser(userId, notification);
    }

    /**
     * Gửi thông báo voucher đã lưu thành công
     */
    public void notifyVoucherSaved(Long userId, String voucherCode, String voucherName) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("VOUCHER_SAVED")
                .title("Lưu voucher thành công")
                .message("Bạn đã lưu voucher \"" + voucherName + "\" (Mã: " + voucherCode + ") thành công!")
                .timestamp(LocalDateTime.now())
                .data(java.util.Map.of("voucherCode", voucherCode, "voucherName", voucherName))
                .build();
        sendNotificationToUser(userId, notification);
    }

    /**
     * Gửi thông báo đặt vé thành công
     * Sử dụng method này sau khi tạo booking/order thành công
     */
    public void notifyBookingSuccess(Long userId, Long orderId, String totalAmount) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("BOOKING_SUCCESS")
                .title("Đặt vé thành công")
                .message("Bạn đã đặt vé thành công! Mã đơn hàng: #" + orderId + ", Tổng tiền: " + totalAmount)
                .timestamp(LocalDateTime.now())
                .data(java.util.Map.of("orderId", orderId, "totalAmount", totalAmount))
                .build();
        sendNotificationToUser(userId, notification);
    }
    
    /**
     * Gửi thông báo đặt hàng thành công (giữ lại để tương thích)
     */
    public void notifyOrderSuccess(Long userId, Long orderId, String totalAmount) {
        notifyBookingSuccess(userId, orderId, totalAmount);
    }
}

