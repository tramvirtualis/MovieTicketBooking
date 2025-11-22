package com.example.backend.services;

import com.example.backend.entities.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    /**
     * Gửi OTP cho đăng ký tài khoản
     */
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã OTP đăng ký tài khoản Cinesmart");
            message.setText(buildOtpEmailContent(otpCode));
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }
    
    /**
     * Gửi OTP cho quên mật khẩu
     */
    public void sendForgotPasswordOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã OTP đặt lại mật khẩu Cinesmart");
            message.setText(buildForgotPasswordOtpContent(otpCode));
            
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage());
        }
    }
    
    /**
     * Xác nhận đặt lại mật khẩu thành công
     */
    public void sendPasswordResetConfirmationEmail(String toEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mật khẩu của bạn đã được đặt lại thành công");
            message.setText(buildPasswordResetConfirmationContent());
            
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Không thể gửi email xác nhận: " + e.getMessage());
        }
    }
    
    private String buildOtpEmailContent(String otpCode) {
        return String.format("""
                Xin chào,
                
                Mã OTP của bạn để đăng ký tài khoản Cinesmart là: %s
                
                Mã OTP này có hiệu lực trong 5 phút.
                
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                
                Trân trọng,
                Đội ngũ Cinesmart
                """, otpCode);
    }
    
    private String buildForgotPasswordOtpContent(String otpCode) {
        return String.format("""
                Xin chào,
                
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Cinesmart của mình.
                
                Mã OTP của bạn là: %s
                
                Mã OTP này có hiệu lực trong 5 phút.
                
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
                
                Trân trọng,
                Đội ngũ Cinesmart
                """, otpCode);
    }
    
    private String buildPasswordResetConfirmationContent() {
        return """
                Xin chào,
                
                Mật khẩu cho tài khoản Cinesmart của bạn đã được đặt lại thành công.
                
                Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo mật tài khoản của bạn.
                
                Trân trọng,
                Đội ngũ Cinesmart
                """;
    }
    
    // Track emails đã gửi trong session để tránh duplicate
    private final java.util.concurrent.ConcurrentHashMap<Long, Long> sentEmailOrders = new java.util.concurrent.ConcurrentHashMap<>();
    
    /**
     * Gửi email xác nhận đặt vé với QR code
     */
    public void sendBookingConfirmationEmail(Order order) {
        // Kiểm tra đã gửi email cho order này chưa (trong vòng 5 phút)
        Long orderId = order.getOrderId();
        Long currentTime = System.currentTimeMillis();
        Long lastSentTime = sentEmailOrders.get(orderId);
        
        if (lastSentTime != null && (currentTime - lastSentTime) < 5 * 60 * 1000) {
            return; // Đã gửi trong vòng 5 phút, không gửi lại
        }
        
        sentEmailOrders.put(orderId, currentTime);
        try {
            // Chỉ gửi email nếu order có tickets (có vé xem phim)
            if (order.getTickets() == null || order.getTickets().isEmpty()) {
                return;
            }
            
            if (order.getUser() == null) {
                return;
            }
            
            String toEmail = order.getUser().getEmail();
            if (toEmail == null || toEmail.isEmpty()) {
                return;
            }
            
            // Lấy thông tin từ order
            Ticket firstTicket = order.getTickets().get(0);
            if (firstTicket.getShowtime() == null) {
                return;
            }
            
            Showtime showtime = firstTicket.getShowtime();
            if (showtime.getMovieVersion() == null) {
                return;
            }
            
            MovieVersion movieVersion = showtime.getMovieVersion();
            if (movieVersion.getMovie() == null) {
                return;
            }
            
            Movie movie = movieVersion.getMovie();
            if (showtime.getCinemaRoom() == null) {
                return;
            }
            
            CinemaRoom room = showtime.getCinemaRoom();
            if (room.getCinemaComplex() == null) {
                return;
            }
            
            CinemaComplex cinema = room.getCinemaComplex();
            
            // Group tickets by showtime để xử lý nhiều vé cùng showtime
            Map<String, List<Ticket>> ticketsByShowtime = order.getTickets().stream()
                .collect(Collectors.groupingBy(t -> 
                    t.getShowtime().getShowtimeId().toString()
                ));
            
            // Tạo QR code cho mỗi nhóm showtime
            List<String> qrCodeBase64List = new ArrayList<>();
            List<BookingInfo> bookingInfoList = new ArrayList<>();
            
            for (List<Ticket> tickets : ticketsByShowtime.values()) {
                Ticket ticket = tickets.get(0);
                Showtime st = ticket.getShowtime();
                
                // Lấy danh sách ghế
                List<String> seatIds = tickets.stream()
                    .map(t -> t.getSeat().getSeatRow() + t.getSeat().getSeatColumn())
                    .sorted()
                    .collect(Collectors.toList());
                
                // Tạo booking ID
                String bookingId = String.format("%d-%d-%s", 
                    order.getOrderId(),
                    st.getShowtimeId(),
                    st.getStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"))
                );
                
                // Tạo dữ liệu cho QR code
                Map<String, Object> qrData = new HashMap<>();
                qrData.put("bookingId", bookingId);
                qrData.put("orderId", order.getOrderId());
                qrData.put("movie", movie.getTitle());
                qrData.put("cinema", cinema.getName() + (cinema.getAddress() != null ? 
                    " (" + (cinema.getAddress().getProvince() != null ? 
                        cinema.getAddress().getDescription() + ", " + cinema.getAddress().getProvince() 
                        : cinema.getAddress().getDescription()) + ")" 
                    : ""));
                qrData.put("date", st.getStartTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                qrData.put("time", st.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")));
                qrData.put("seats", seatIds);
                qrData.put("format", mapRoomType(movieVersion.getRoomType()));
                
                // Tạo QR code
                String qrCodeBase64 = generateQRCode(qrData);
                qrCodeBase64List.add(qrCodeBase64);
                
                // Tính tổng giá cho nhóm vé này
                BigDecimal totalPrice = tickets.stream()
                    .map(Ticket::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                // Lưu thông tin booking
                BookingInfo bookingInfo = new BookingInfo();
                bookingInfo.movieTitle = movie.getTitle();
                bookingInfo.cinemaName = cinema.getName();
                bookingInfo.cinemaAddress = cinema.getAddress() != null 
                    ? (cinema.getAddress().getProvince() != null 
                        ? cinema.getAddress().getDescription() + ", " + cinema.getAddress().getProvince()
                        : cinema.getAddress().getDescription())
                    : "";
                bookingInfo.date = st.getStartTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                bookingInfo.time = st.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                bookingInfo.format = mapRoomType(movieVersion.getRoomType());
                bookingInfo.seats = seatIds;
                bookingInfo.price = totalPrice;
                bookingInfo.bookingId = bookingId;
                bookingInfoList.add(bookingInfo);
            }
            
            // Tạo HTML email với CID cho QR code
            List<String> qrCodeCids = new ArrayList<>();
            for (int i = 0; i < qrCodeBase64List.size(); i++) {
                qrCodeCids.add("qr-code-" + order.getOrderId() + "-" + i);
            }
            String htmlContent = buildBookingEmailHtml(bookingInfoList, qrCodeCids, order);
            
            // Gửi email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đặt vé thành công - Cinesmart Cinema");
            helper.setText(htmlContent, true);
            
            // Embed QR code images inline using CID
            for (int i = 0; i < qrCodeBase64List.size(); i++) {
                byte[] qrCodeBytes = Base64.getDecoder().decode(qrCodeBase64List.get(i));
                helper.addInline(qrCodeCids.get(i), 
                    () -> new java.io.ByteArrayInputStream(qrCodeBytes),
                    "image/png");
            }
            
            mailSender.send(message);
        } catch (Exception e) {
            // Không throw exception để không ảnh hưởng đến flow thanh toán
        }
    }
    
    /**
     * Tạo QR code từ dữ liệu và trả về base64 string
     */
    private String generateQRCode(Map<String, Object> data) {
        try {
            // Convert data to JSON string
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonData = objectMapper.writeValueAsString(data);
            
            // Tạo QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);
            
            BitMatrix bitMatrix = qrCodeWriter.encode(jsonData, BarcodeFormat.QR_CODE, 300, 300, hints);
            
            // Convert to PNG
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            
            // Convert to base64
            return Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            return "";
        }
    }
    
    /**
     * Tạo HTML email template
     */
    private String buildBookingEmailHtml(List<BookingInfo> bookingInfoList, 
                                         List<String> qrCodeCids, 
                                         Order order) {
        StringBuilder html = new StringBuilder();
        html.append("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                    }
                    .header {
                        background: linear-gradient(135deg, #e83b41 0%, #c92e33 100%);
                        padding: 30px 24px;
                        text-align: center;
                        color: #ffffff;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                        font-weight: 800;
                        margin-bottom: 8px;
                    }
                    .header p {
                        margin: 0;
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 24px;
                    }
                    .ticket-section {
                        margin-bottom: 30px;
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    .movie-info {
                        background-color: #2a2a2a;
                        padding: 20px;
                        text-align: center;
                        color: #ffffff;
                    }
                    .movie-title {
                        font-size: 24px;
                        font-weight: 800;
                        margin: 0 0 8px 0;
                        color: #ffffff;
                    }
                    .cinema-name {
                        font-size: 14px;
                        color: #cccccc;
                        margin: 0;
                    }
                    .ticket-details {
                        padding: 20px;
                        background-color: #fafafa;
                    }
                    .details-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                        margin-bottom: 20px;
                    }
                    .detail-item {
                        font-size: 13px;
                    }
                    .detail-label {
                        color: #555;
                        font-weight: 600;
                        margin-bottom: 4px;
                    }
                    .detail-value {
                        color: #000;
                        font-weight: 700;
                        font-size: 16px;
                    }
                    .detail-value.price {
                        color: #e83b41;
                        font-size: 20px;
                        font-weight: 800;
                    }
                    .qr-section {
                        text-align: center;
                        padding: 20px;
                        background-color: #fff;
                        border-top: 2px dashed #ddd;
                    }
                    .qr-code {
                        display: inline-block;
                        padding: 16px;
                        background-color: #fff;
                        border-radius: 8px;
                        border: 1px solid #eee;
                    }
                    .qr-code img {
                        width: 200px;
                        height: 200px;
                        display: block;
                    }
                    .qr-label {
                        font-size: 14px;
                        color: #333;
                        margin-bottom: 12px;
                        font-weight: 600;
                    }
                    .booking-id {
                        font-size: 12px;
                        color: #555;
                        margin-top: 12px;
                        font-weight: 500;
                    }
                    .footer {
                        padding: 16px 24px;
                        background-color: #f5f5f5;
                        border-radius: 0 0 12px 12px;
                        font-size: 13px;
                        color: #333;
                        text-align: center;
                    }
                    .footer-info {
                        margin-bottom: 4px;
                    }
                    .footer-note {
                        margin-top: 8px;
                        font-size: 12px;
                        color: #555;
                    }
                    .order-info {
                        background-color: #f9f9f9;
                        padding: 16px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        font-size: 13px;
                        color: #333;
                    }
                    .order-info-item {
                        margin-bottom: 8px;
                    }
                    .order-info-item:last-child {
                        margin-bottom: 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>VÉ XEM PHIM</h1>
                        <p>Cinesmart Cinema</p>
                    </div>
                    <div class="content">
                        <div class="order-info">
                            <div class="order-info-item"><strong>Mã đơn hàng:</strong> #""");
        html.append(order.getOrderId());
        html.append("</div>");
        html.append("<div class=\"order-info-item\"><strong>Ngày đặt:</strong> ");
        html.append(order.getOrderDate() != null ? 
            order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
        html.append("</div>");
        html.append("<div class=\"order-info-item\"><strong>Tổng tiền:</strong> ");
        html.append(formatPrice(order.getTotalAmount()));
        html.append("</div>");
        html.append("</div>");
        
        // Tạo ticket cho mỗi booking
        for (int i = 0; i < bookingInfoList.size(); i++) {
            BookingInfo info = bookingInfoList.get(i);
            String qrCodeCid = i < qrCodeCids.size() ? qrCodeCids.get(i) : "";
            
            html.append("""
                <div class="ticket-section">
                    <div class="movie-info">
                        <h2 class="movie-title">""");
            html.append(escapeHtml(info.movieTitle));
            html.append("</h2>");
            html.append("<p class=\"cinema-name\">");
            html.append(escapeHtml(info.cinemaName));
            if (!info.cinemaAddress.isEmpty()) {
                html.append(" (").append(escapeHtml(info.cinemaAddress)).append(")");
            }
            html.append("</p>");
            html.append("</div>");
            html.append("<div class=\"ticket-details\">");
            html.append("<div class=\"details-grid\">");
            html.append("<div class=\"detail-item\">");
            html.append("<div class=\"detail-label\">Ngày chiếu</div>");
            html.append("<div class=\"detail-value\">").append(info.date).append("</div>");
            html.append("</div>");
            html.append("<div class=\"detail-item\">");
            html.append("<div class=\"detail-label\">Giờ chiếu</div>");
            html.append("<div class=\"detail-value\">").append(info.time).append("</div>");
            html.append("</div>");
            html.append("<div class=\"detail-item\">");
            html.append("<div class=\"detail-label\">Định dạng</div>");
            html.append("<div class=\"detail-value\">").append(info.format).append("</div>");
            html.append("</div>");
            html.append("<div class=\"detail-item\">");
            html.append("<div class=\"detail-label\">Ghế</div>");
            html.append("<div class=\"detail-value\">").append(String.join(", ", info.seats)).append("</div>");
            html.append("</div>");
            html.append("<div class=\"detail-item\" style=\"grid-column: 1 / -1;\">");
            html.append("<div class=\"detail-label\">Tổng tiền</div>");
            html.append("<div class=\"detail-value price\">").append(formatPrice(info.price)).append("</div>");
            html.append("</div>");
            html.append("</div>");
            html.append("</div>");
            
            // QR Code section - sử dụng CID để hiển thị inline
            html.append("<div class=\"qr-section\">");
            html.append("<div class=\"qr-label\">Mã QR Code - Vui lòng quét tại rạp</div>");
            if (!qrCodeCid.isEmpty()) {
                html.append("<div class=\"qr-code\">");
                html.append("<img src=\"cid:").append(qrCodeCid).append("\" alt=\"QR Code\" />");
                html.append("</div>");
            }
            html.append("<div class=\"booking-id\">Booking ID: ").append(info.bookingId).append("</div>");
            html.append("</div>");
            html.append("<div class=\"footer\">");
            html.append("<div class=\"footer-info\">Ngày đặt: ");
            html.append(order.getOrderDate() != null ? 
                order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "");
            html.append("</div>");
            html.append("<div class=\"footer-note\">Vui lòng đến rạp trước giờ chiếu 15 phút</div>");
            html.append("</div>");
            html.append("</div>");
        }
        
        html.append("""
                    </div>
                </div>
            </body>
            </html>
            """);
        
        return html.toString();
    }
    
    private String formatPrice(BigDecimal price) {
        if (price == null) return "0 ₫";
        return price.setScale(0, RoundingMode.HALF_UP).toPlainString() + " ₫";
    }
    
    private String mapRoomType(com.example.backend.entities.enums.RoomType roomType) {
        if (roomType == null) return "2D";
        return roomType.name().replace("TYPE_", "");
    }
    
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
    
    // Helper class để lưu thông tin booking
    private static class BookingInfo {
        String movieTitle;
        String cinemaName;
        String cinemaAddress;
        String date;
        String time;
        String format;
        List<String> seats;
        BigDecimal price;
        String bookingId;
    }
}