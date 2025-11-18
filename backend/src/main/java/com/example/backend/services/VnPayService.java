package com.example.backend.services;

import com.example.backend.config.VnPayProperties;
import com.example.backend.entities.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class VnPayService {

    private static final DateTimeFormatter VNPAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private final VnPayProperties properties;

    public String generatePaymentUrl(Order order, BigDecimal amount, String clientIp) {
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", properties.getVersion());
        vnpParams.put("vnp_Command", properties.getCommand());
        vnpParams.put("vnp_TmnCode", properties.getTmnCode());
        vnpParams.put("vnp_Amount", formatAmount(amount));
        vnpParams.put("vnp_CurrCode", properties.getCurrency());
        vnpParams.put("vnp_TxnRef", order.getVnpTxnRef());
        vnpParams.put("vnp_OrderInfo", order.getOrderInfo() != null ? order.getOrderInfo() : ("Thanh toan don hang #" + order.getOrderId()));
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", properties.getLocale());
        vnpParams.put("vnp_ReturnUrl", properties.getReturnUrl());
        vnpParams.put("vnp_IpAddr", clientIp != null && !clientIp.isBlank() ? clientIp : "127.0.0.1");
        vnpParams.put("vnp_CreateDate", VNPAY_DATE_FORMATTER.format(order.getOrderDate()));
        vnpParams.put("vnp_SecureHashType", properties.getSecureHashType());
        if (order.getPaymentExpiredAt() != null) {
            vnpParams.put("vnp_ExpireDate", VNPAY_DATE_FORMATTER.format(order.getPaymentExpiredAt()));
        }

        String query = buildQueryString(vnpParams);
        Map<String, String> hashFields = new TreeMap<>(vnpParams);
        hashFields.remove("vnp_SecureHashType");
        String secureHash = hashAllFields(hashFields);

        return properties.getPaymentUrl() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    public boolean validateSignature(Map<String, String> fields, String receivedHash) {
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }
        Map<String, String> sorted = new TreeMap<>(fields);
        sorted.remove("vnp_SecureHash");
        sorted.remove("vnp_SecureHashType");
        String calculated = hashAllFields(sorted);
        return receivedHash.equalsIgnoreCase(calculated);
    }

    private String buildQueryString(Map<String, String> fields) {
        StringBuilder query = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : fields.entrySet()) {
            if (!first) {
                query.append('&');
            } else {
                first = false;
            }
            query.append(entry.getKey())
                    .append('=')
                    .append(urlEncode(entry.getValue()));
        }
        return query.toString();
    }

    private String hashAllFields(Map<String, String> fields) {
        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : fields.entrySet()) {
            if (!first) {
                hashData.append('&');
            } else {
                first = false;
            }
            hashData.append(entry.getKey())
                    .append('=')
                    .append(urlEncode(entry.getValue()));
        }
        return hmacSHA512(properties.getHashSecret(), hashData.toString());
    }

    private String formatAmount(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .toBigInteger()
                .toString();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes).toUpperCase();
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tạo chữ ký bảo mật", e);
        }
    }
}


