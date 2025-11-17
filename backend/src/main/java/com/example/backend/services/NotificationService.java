package com.example.backend.services;

import com.example.backend.dtos.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo đến một user cụ thể
     * @param userId ID của user
     * @param notification Notification DTO
     */
    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        try {
            String destination = "/queue/notifications/" + userId;
            messagingTemplate.convertAndSend(destination, notification);
            log.info("Notification sent to user {}: {}", userId, notification.getType());
        } catch (Exception e) {
            log.error("Error sending notification to user {}: {}", userId, e.getMessage(), e);
        }
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
     * Gửi thông báo đặt hàng thành công
     * Sử dụng method này trong OrderService sau khi tạo order thành công
     * Ví dụ: notificationService.notifyOrderSuccess(userId, orderId, totalAmount.toString());
     */
    public void notifyOrderSuccess(Long userId, Long orderId, String totalAmount) {
        NotificationDTO notification = NotificationDTO.builder()
                .type("ORDER_SUCCESS")
                .title("Đặt hàng thành công")
                .message("Đơn hàng của bạn đã được đặt thành công! Mã đơn hàng: #" + orderId + ", Tổng tiền: " + totalAmount)
                .timestamp(LocalDateTime.now())
                .data(java.util.Map.of("orderId", orderId, "totalAmount", totalAmount))
                .build();
        sendNotificationToUser(userId, notification);
    }
}

