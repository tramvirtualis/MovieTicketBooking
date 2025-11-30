# LÝ DO CHỌN ĐỀ TÀI VÀ MỤC TIÊU

## 1. Lý do chọn đề tài

Trong bối cảnh chuyển đổi số mạnh mẽ tại Việt Nam, việc ứng dụng công nghệ thông tin vào các lĩnh vực dịch vụ đang trở thành xu hướng tất yếu. Đặc biệt, ngành công nghiệp điện ảnh Việt Nam đang chứng kiến sự thay đổi đáng kể trong thói quen tiêu dùng của khán giả. Thế hệ Gen Z và Millennials, những đối tượng chiếm tỷ trọng lớn trong thị trường điện ảnh, có xu hướng ưu tiên sử dụng các dịch vụ trực tuyến do tính tiện lợi, nhanh chóng và khả năng cá nhân hóa trải nghiệm.

Tuy nhiên, thị trường đặt vé xem phim trực tuyến tại Việt Nam hiện tại vẫn còn nhiều hạn chế. Các hệ thống đặt vé hiện có thường gặp phải các vấn đề như: giao diện người dùng chưa thân thiện, quy trình đặt vé phức tạp, thiếu tính năng quản lý linh hoạt cho các cụm rạp, khả năng xử lý thanh toán trực tuyến chưa đa dạng, và chưa có cơ chế quản lý quy tắc nghiệp vụ linh hoạt. Điều này dẫn đến trải nghiệm người dùng chưa tối ưu và hiệu quả quản lý của các rạp chiếu phim chưa cao.

Hơn nữa, với sự phát triển của công nghệ, việc xây dựng một hệ thống đặt vé xem phim hiện đại cần tích hợp nhiều tính năng tiên tiến như: quản lý lịch chiếu thông minh, hệ thống đặt ghế trực tuyến với cập nhật thời gian thực, tích hợp thanh toán điện tử đa dạng (ZaloPay, MoMo, VNPay), quản lý voucher và chương trình khuyến mãi linh hoạt, và đặc biệt là sử dụng Business Rules Engine để quản lý các quy tắc nghiệp vụ động như định giá, validation lịch chiếu, và tính toán giảm giá.

Xuất phát từ những thực trạng và nhu cầu trên, việc nghiên cứu và phát triển một hệ thống đặt vé xem phim trực tuyến toàn diện, hiện đại, và phù hợp với bối cảnh Việt Nam là một vấn đề cấp thiết. Hệ thống này không chỉ đáp ứng nhu cầu của người dùng cuối mà còn hỗ trợ hiệu quả cho việc quản lý của các cụm rạp chiếu phim, góp phần thúc đẩy sự phát triển của ngành công nghiệp điện ảnh Việt Nam trong kỷ nguyên số.

## 2. Mục tiêu nghiên cứu

### 2.1. Mục tiêu chung

Nghiên cứu và xây dựng một hệ thống đặt vé xem phim trực tuyến toàn diện, hiện đại, sử dụng các công nghệ web tiên tiến, nhằm nâng cao trải nghiệm người dùng và hiệu quả quản lý cho các cụm rạp chiếu phim tại Việt Nam.

### 2.2. Mục tiêu cụ thể

1. **Phân tích và thiết kế hệ thống:**
   - Nghiên cứu nhu cầu thực tế của người dùng và các cụm rạp chiếu phim trong việc đặt vé trực tuyến.
   - Phân tích các hệ thống đặt vé hiện có để xác định ưu nhược điểm và rút ra bài học kinh nghiệm.
   - Thiết kế kiến trúc hệ thống theo mô hình Client-Server 3 tầng (Presentation, Business Logic, Data) với các công nghệ phù hợp.

2. **Xây dựng tầng Frontend:**
   - Phát triển giao diện người dùng hiện đại, thân thiện sử dụng React.js và Tailwind CSS.
   - Xây dựng các tính năng cốt lõi: tìm kiếm phim, xem lịch chiếu, đặt ghế trực tuyến với cập nhật thời gian thực qua WebSocket.
   - Tích hợp thanh toán trực tuyến đa dạng (ZaloPay, MoMo, VNPay).
   - Xây dựng dashboard quản trị cho Admin và Manager với các chức năng quản lý toàn diện.

3. **Xây dựng tầng Backend:**
   - Phát triển RESTful API sử dụng Spring Boot 3.5.7 và Java 17.
   - Triển khai hệ thống xác thực và phân quyền dựa trên JWT và Spring Security.
   - Tích hợp Business Rules Engine (Drools) để quản lý các quy tắc nghiệp vụ động:
     - Quy tắc validation lịch chiếu (kiểm tra xung đột thời gian, không cho phép lịch trong quá khứ).
     - Quy tắc tính giá vé (áp dụng phụ thu cuối tuần).
     - Quy tắc validation và tính toán giảm giá voucher.
   - Xây dựng hệ thống WebSocket (STOMP) cho cập nhật thời gian thực về trạng thái ghế ngồi.
   - Tích hợp dịch vụ email để gửi xác nhận đơn hàng và thông báo.

4. **Xây dựng tầng Database:**
   - Thiết kế cơ sở dữ liệu quan hệ sử dụng MySQL với 15 bảng chính.
   - Đảm bảo tính toàn vẹn dữ liệu thông qua các ràng buộc (constraints) và quan hệ (relationships).
   - Tối ưu hiệu suất truy vấn thông qua việc tạo các chỉ mục (indexes) phù hợp.

5. **Kiểm thử và đánh giá:**
   - Thực hiện kiểm thử chức năng cho tất cả các module của hệ thống.
   - Kiểm thử tích hợp giữa các thành phần (Frontend, Backend, Database).
   - Đánh giá hiệu suất và khả năng mở rộng của hệ thống.
   - Thu thập phản hồi từ người dùng thử nghiệm để cải thiện hệ thống.

6. **Tài liệu hóa:**
   - Xây dựng tài liệu kỹ thuật chi tiết về kiến trúc hệ thống, công nghệ sử dụng, và quy trình triển khai.
   - Tạo tài liệu hướng dẫn sử dụng cho người dùng cuối và quản trị viên.

### 2.3. Ý nghĩa của đề tài

**Ý nghĩa khoa học:**
- Áp dụng và tích hợp các công nghệ web hiện đại (React.js, Spring Boot, Drools) trong một hệ thống thực tế.
- Nghiên cứu và triển khai Business Rules Engine để quản lý quy tắc nghiệp vụ động, tách biệt logic nghiệp vụ khỏi code.
- Đóng góp vào việc nghiên cứu kiến trúc hệ thống phân tầng và tích hợp real-time communication trong ứng dụng web.

**Ý nghĩa thực tiễn:**
- Cung cấp một giải pháp đặt vé xem phim trực tuyến hoàn chỉnh, có thể áp dụng trực tiếp cho các cụm rạp chiếu phim tại Việt Nam.
- Nâng cao trải nghiệm người dùng thông qua giao diện thân thiện, quy trình đặt vé đơn giản, và tính năng đa dạng.
- Hỗ trợ hiệu quả cho việc quản lý của các cụm rạp thông qua các công cụ quản trị toàn diện và báo cáo thống kê.
- Góp phần thúc đẩy quá trình số hóa trong ngành công nghiệp điện ảnh Việt Nam.



