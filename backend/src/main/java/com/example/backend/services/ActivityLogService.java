package com.example.backend.services;

import com.example.backend.dtos.ActivityLogResponseDTO;
import com.example.backend.entities.*;
import com.example.backend.entities.enums.Action;
import com.example.backend.entities.enums.ObjectType;
import com.example.backend.repositories.ActivityLogRepository;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.entities.Manager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogService {
    
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Log một hoạt động (helper method để các service khác gọi)
     * Sử dụng REQUIRES_NEW để chạy trong transaction riêng, không bị ảnh hưởng bởi transaction chính
     * 
     * @param username Username của người thực hiện
     * @param action Hành động (CREATE, UPDATE, DELETE)
     * @param objectType Loại đối tượng
     * @param objectId ID của đối tượng
     * @param objectName Tên của đối tượng
     * @param description Mô tả chi tiết
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logActivity(String username, Action action, ObjectType objectType, 
                           Long objectId, String objectName, String description) {
        try {
            log.info("=== START LOGGING ACTIVITY ===");
            log.info("Username: {}, Action: {}, ObjectType: {}, ObjectId: {}, ObjectName: {}", 
                    username, action, objectType, objectId, objectName);
            
            if (username == null || username.isEmpty()) {
                log.error("Cannot log activity: Username is null or empty");
                return;
            }
            
            User actor = userRepository.findByUsername(username)
                    .orElse(null);
            
            if (actor == null) {
                log.error("Cannot log activity: User not found with username: {}", username);
                log.error("Available users check - this is a critical error!");
                return;
            }
            
            log.info("Actor found - userId: {}, username: {}, class: {}", 
                    actor.getUserId(), actor.getUsername(), actor.getClass().getName());
            
            ActivityLog activityLog = ActivityLog.builder()
                    .actor(actor)
                    .action(action)
                    .objectType(objectType)
                    .objectId(objectId)
                    .objectName(objectName != null ? objectName : "")
                    .description(description != null ? description : "")
                    .timestamp(LocalDateTime.now())
                    .build();
            
            log.info("ActivityLog entity created, attempting to save...");
            ActivityLog savedLog = activityLogRepository.save(activityLog);
            log.info("Activity saved successfully - activityId: {}", savedLog.getActivityId());
            log.info("Activity logged: {} {} {} by {}", action, objectType, objectName, username);
            
            // Flush để đảm bảo đã lưu vào database
            activityLogRepository.flush();
            log.info("Database flush completed");
            
            // Broadcast activity to WebSocket - chỉ broadcast nếu actor là Admin
            try {
                if (actor instanceof Admin) {
                    ActivityLogResponseDTO activityDTO = convertToDTO(savedLog);
                    // Broadcast to all admins
                    messagingTemplate.convertAndSend("/topic/activities/admin", activityDTO);
                    log.info("Broadcasted to /topic/activities/admin");
                    log.info("Activity broadcasted via WebSocket: {} {} {}", action, objectType, objectName);
                } else {
                    log.info("Activity not broadcasted - actor is not Admin (actor type: {})", actor.getClass().getName());
                }
            } catch (Exception e) {
                log.error("Error broadcasting activity via WebSocket: {}", e.getMessage(), e);
                // Không throw exception để không ảnh hưởng đến flow chính
            }
            log.info("=== END LOGGING ACTIVITY ===");
        } catch (Exception e) {
            log.error("CRITICAL ERROR logging activity: {}", e.getMessage(), e);
            log.error("Exception type: {}", e.getClass().getName());
            e.printStackTrace();
            // KHÔNG throw exception để không ảnh hưởng đến flow chính
            // Activity log failure không nên làm fail business logic
        }
    }
    
    /**
     * Lấy tất cả hoạt động của admin (cho Admin)
     * Chỉ lấy activities của ADMIN, không lấy MANAGER
     * Có thể filter theo username, action, objectType, khoảng thời gian
     */
    public List<ActivityLogResponseDTO> getAllActivities(String username, Action action, 
                                                        ObjectType objectType, 
                                                        LocalDateTime startDate, 
                                                        LocalDateTime endDate) {
        List<ActivityLog> activities;
        
        // Lấy tất cả activities trước
        if (username != null || action != null || objectType != null || startDate != null || endDate != null) {
            // Có filter
            activities = activityLogRepository.findWithFilters(
                    username, action, objectType, startDate, endDate
            );
        } else {
            // Không có filter, lấy tất cả
            activities = activityLogRepository.findAllByOrderByTimestampDesc();
        }
        
        // Filter chỉ lấy activities của ADMIN
        return activities.stream()
                .filter(activity -> activity.getActor() instanceof Admin)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Xóa một hoạt động theo ID
     * Chỉ admin mới có quyền xóa
     */
    @Transactional
    public boolean deleteActivity(Long activityId) {
        try {
            if (activityId == null) {
                log.error("Cannot delete activity: activityId is null");
                return false;
            }
            
            ActivityLog activity = activityLogRepository.findById(activityId)
                    .orElse(null);
            
            if (activity == null) {
                log.error("Cannot delete activity: Activity not found with id: {}", activityId);
                return false;
            }
            
            // Chỉ cho phép xóa activities của Admin
            if (!(activity.getActor() instanceof Admin)) {
                log.error("Cannot delete activity: Only admin activities can be deleted");
                return false;
            }
            
            activityLogRepository.deleteById(activityId);
            log.info("Activity deleted successfully - activityId: {}", activityId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting activity: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Convert ActivityLog entity sang DTO
     */
    private ActivityLogResponseDTO convertToDTO(ActivityLog activityLog) {
        User actor = activityLog.getActor();
        String actorRole = "";
        String actorName = "";
        
        // Xác định role của actor
        if (actor instanceof Admin) {
            actorRole = "ADMIN";
            actorName = "Quản trị viên";
        } else if (actor instanceof Manager) {
            actorRole = "MANAGER";
            Manager manager = (Manager) actor;
            // Lấy tên từ cinemaComplex hoặc username
            if (manager.getCinemaComplex() != null) {
                actorName = "Quản lý " + manager.getCinemaComplex().getName();
            } else {
                actorName = "Quản lý " + actor.getUsername();
            }
        }
        
        // Map action label
        String actionLabel = "";
        switch (activityLog.getAction()) {
            case CREATE:
                actionLabel = "Thêm";
                break;
            case UPDATE:
                actionLabel = "Sửa";
                break;
            case DELETE:
                actionLabel = "Xóa";
                break;
        }
        
        // Map objectType label
        String objectLabel = "";
        switch (activityLog.getObjectType()) {
            case MOVIE:
                objectLabel = "Phim";
                break;
            case CINEMA:
                objectLabel = "Rạp";
                break;
            case ROOM:
                objectLabel = "Phòng chiếu";
                break;
            case SHOWTIME:
                objectLabel = "Lịch chiếu";
                break;
            case USER:
                objectLabel = "Người dùng";
                break;
            case VOUCHER:
                objectLabel = "Voucher";
                break;
            case BANNER:
                objectLabel = "Banner";
                break;
            case FOOD:
                objectLabel = "Đồ ăn";
                break;
        }
        
        return ActivityLogResponseDTO.builder()
                .activityId(activityLog.getActivityId())
                .actorUsername(actor.getUsername())
                .actorName(actorName)
                .actorRole(actorRole)
                .action(activityLog.getAction())
                .actionLabel(actionLabel)
                .objectType(activityLog.getObjectType())
                .objectLabel(objectLabel)
                .objectId(activityLog.getObjectId())
                .objectName(activityLog.getObjectName())
                .description(activityLog.getDescription())
                .timestamp(activityLog.getTimestamp())
                .build();
    }
}

