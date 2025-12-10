package com.example.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "momo")
public class MomoProperties {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String endpoint;
    private String redirectUrl;
    private String ipnUrl;
    private String requestType = "captureWallet";
    private String partnerName = "Cinesmart";
    private String storeId = "CinesmartStore";
    private String lang = "vi";
    private String extraData = "";
    private String paymentCode = "";
    private String orderGroupId = "";
    private boolean autoCapture = true;
    private String returnPageUrl;
    
    // Explicit getter để đảm bảo IDE nhận diện và có fallback
    public String getReturnPageUrl() {
        if (returnPageUrl != null && !returnPageUrl.isEmpty()) {
            return returnPageUrl;
        }
        // Fallback: lấy từ FRONTEND_URL hoặc dùng localhost cho dev
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl == null || frontendUrl.isEmpty()) {
            frontendUrl = "http://localhost:5173"; // Fallback cho local dev
        }
        return frontendUrl + "/payment/momo-return";
    }
}


