# CHƯƠNG 2: KHẢO SÁT HIỆN TRẠNG VÀ YÊU CẦU CHỨC NĂNG

## 2.1. Khảo sát hiện trạng

### 2.1.1. Phân tích các hệ thống rạp chiếu phim lớn tại Việt Nam

Để xây dựng một hệ thống đặt vé xem phim hiệu quả và đáp ứng nhu cầu của người dùng, nhóm đã tiến hành khảo sát và phân tích các hệ thống rạp chiếu phim lớn tại Việt Nam, bao gồm CGV Cinemas, Galaxy Cinema, và BHD Star Cineplex. Việc khảo sát tập trung vào các khía cạnh chính: giao diện người dùng, chức năng đặt vé, hệ thống quản lý, và các điểm mạnh cần học hỏi.

**CGV Cinemas** là một trong những chuỗi rạp chiếu phim lớn nhất tại Việt Nam với hệ thống đặt vé trực tuyến hiện đại. Giao diện website của CGV được thiết kế trực quan và thân thiện với người dùng, với các banner quảng cáo phim nổi bật và danh sách phim được sắp xếp rõ ràng. Hệ thống cho phép khách hàng tìm kiếm phim theo nhiều tiêu chí như tên phim, rạp chiếu, ngày chiếu, và định dạng phim (2D, 3D, IMAX). Quy trình đặt vé được tối ưu hóa với sơ đồ ghế tương tác, cho phép khách hàng chọn ghế một cách trực quan. CGV tích hợp nhiều phương thức thanh toán như thẻ tín dụng, ví điện tử, và thanh toán tại rạp. Hệ thống quản lý của CGV cung cấp các công cụ mạnh mẽ để quản lý lịch chiếu, giá vé, và báo cáo doanh thu.

**Galaxy Cinema** cũng là một đối thủ cạnh tranh lớn với hệ thống đặt vé trực tuyến được đánh giá cao. Giao diện của Galaxy Cinema tập trung vào trải nghiệm người dùng với các tính năng như xem trailer phim, đọc đánh giá từ khách hàng khác, và lưu danh sách phim yêu thích. Hệ thống đặt vé của Galaxy Cinema hỗ trợ đặt combo đồ ăn kèm theo vé, mang lại sự tiện lợi cho khách hàng. Galaxy Cinema cũng có chương trình khuyến mãi và voucher giảm giá thường xuyên, thu hút khách hàng quay lại sử dụng dịch vụ.

**BHD Star Cineplex** là một chuỗi rạp chiếu phim khác với hệ thống đặt vé trực tuyến ổn định. Giao diện của BHD Star Cineplex được thiết kế đơn giản và dễ sử dụng, phù hợp với mọi lứa tuổi. Hệ thống cung cấp thông tin chi tiết về từng phim, bao gồm diễn viên, đạo diễn, thể loại, và độ tuổi cho phép. BHD Star Cineplex cũng tích hợp với các cổng thanh toán phổ biến tại Việt Nam như MoMo và ZaloPay, mang lại sự thuận tiện cho khách hàng.

### 2.1.2. Tổng kết và đánh giá

Từ việc khảo sát các hệ thống trên, nhóm đã rút ra được nhiều bài học quan trọng. Về mặt kỹ thuật, các hệ thống đều sử dụng công nghệ web hiện đại với giao diện responsive, đảm bảo trải nghiệm tốt trên mọi thiết bị. Về trải nghiệm người dùng, các hệ thống đều tập trung vào việc tối ưu hóa quy trình đặt vé, giảm thiểu số bước cần thiết để hoàn tất đơn hàng. Về quản lý, các hệ thống đều cung cấp các công cụ báo cáo và thống kê mạnh mẽ để hỗ trợ việc ra quyết định kinh doanh.

Tuy nhiên, các hệ thống hiện tại vẫn còn một số điểm có thể cải thiện. Ví dụ, một số hệ thống chưa có tính năng đặt đồ ăn độc lập mà không cần đặt vé phim. Một số hệ thống chưa có tính năng quản lý đánh giá và phản hồi từ khách hàng một cách hiệu quả. Đây là những cơ hội để hệ thống mới có thể cải thiện và vượt trội so với các đối thủ cạnh tranh.

## 2.2. Yêu cầu chức năng

Hệ thống được thiết kế với mô hình phân quyền rõ ràng, phân chia người dùng thành ba vai trò chính: **Khách hàng (Customer)**, **Quản lý rạp (Manager)**, và **Quản trị viên (Admin)**. Mỗi vai trò có các quyền và chức năng riêng, đảm bảo tính bảo mật và hiệu quả trong quản lý hệ thống.

#### 2.2.1.1. Khách hàng (Customer)

Khách hàng là người dùng cuối của hệ thống, có quyền truy cập vào các chức năng cơ bản để đặt vé và quản lý tài khoản của mình. Các quyền và chức năng của khách hàng bao gồm:

**Quản lý tài khoản:** Khách hàng có thể đăng ký tài khoản mới, đăng nhập vào hệ thống bằng tài khoản đã đăng ký hoặc thông qua Google OAuth. Khách hàng có thể xem và cập nhật thông tin cá nhân của mình, bao gồm họ tên, email, số điện thoại, và địa chỉ. Hệ thống cung cấp chức năng quên mật khẩu và đặt lại mật khẩu thông qua email OTP, đảm bảo tính bảo mật của tài khoản.

**Duyệt và tìm kiếm phim:** Khách hàng có thể xem danh sách các phim đang chiếu và sắp chiếu, xem thông tin chi tiết về từng bộ phim bao gồm trailer, diễn viên, đạo diễn, thể loại, và đánh giá. Hệ thống cung cấp các công cụ tìm kiếm và lọc phim theo nhiều tiêu chí khác nhau như tên phim, thể loại, rạp chiếu, và ngày chiếu. Khách hàng có thể xem lịch chiếu của các phim tại các rạp khác nhau và lọc theo định dạng phim (2D, 3D, IMAX, v.v.).

**Đặt vé xem phim:** Khách hàng có thể chọn phim, suất chiếu, và ghế ngồi thông qua giao diện trực quan. Hệ thống cung cấp sơ đồ ghế tương tác, cho phép khách hàng xem vị trí và loại ghế, cũng như trạng thái ghế (trống, đã chọn, đã bán). Hệ thống sử dụng WebSocket để cập nhật trạng thái ghế theo thời gian thực, đảm bảo không có xung đột khi nhiều người cùng chọn ghế. Khách hàng có thể đặt combo đồ ăn kèm theo vé, với khả năng tùy chỉnh số lượng và loại combo.

**Thanh toán:** Khách hàng có thể thanh toán đơn hàng thông qua các cổng thanh toán tích hợp như ZaloPay và MoMo. Hệ thống cung cấp mã QR code để khách hàng sử dụng khi đến rạp, đảm bảo quy trình nhận vé nhanh chóng và thuận tiện.

**Quản lý đơn hàng:** Khách hàng có thể xem lịch sử đơn hàng của mình, bao gồm các đơn hàng đã hoàn thành và đang chờ thanh toán. Khách hàng có thể xem chi tiết từng đơn hàng, bao gồm thông tin phim, suất chiếu, ghế ngồi, combo đồ ăn, và mã QR code.

**Đánh giá phim:** Khách hàng có thể viết đánh giá và nhận xét về các bộ phim đã xem, với khả năng đánh giá bằng sao (từ 1 đến 5 sao) và viết nhận xét chi tiết. Khách hàng có thể xem các đánh giá của khách hàng khác để tham khảo trước khi quyết định xem phim.

**Yêu thích phim:** Khách hàng có thể đánh dấu các phim mà họ yêu thích và xem lại danh sách phim yêu thích của mình trong trang "Thư viện" (Library).

**Đặt đồ ăn độc lập:** Khách hàng có thể đặt đồ ăn mà không cần đặt vé phim, chọn rạp chiếu và đặt combo đồ ăn trực tiếp.

#### 2.2.1.2. Quản lý rạp (Manager)

Quản lý rạp là người chịu trách nhiệm quản lý một cụm rạp cụ thể, có quyền truy cập vào các chức năng quản lý liên quan đến rạp của mình. Manager chỉ có thể quản lý các hoạt động trong phạm vi cụm rạp được giao, không thể truy cập hoặc quản lý các cụm rạp khác. Các quyền và chức năng của quản lý rạp bao gồm:

**Quản lý phim:** Quản lý rạp có thể xem danh sách tất cả các phim có sẵn trong hệ thống (do quản trị viên tạo) và danh sách các phim đang được chiếu tại rạp của mình. Quản lý có thể thêm phim từ danh sách phim có sẵn vào rạp của mình để bắt đầu chiếu, hoặc xóa phim khỏi rạp khi không còn chiếu nữa. Quản lý không thể tạo mới phim, chỉnh sửa thông tin phim, hoặc xóa phim khỏi hệ thống - những chức năng này chỉ dành cho quản trị viên. Quản lý có thể xem thông tin chi tiết về từng phim đang chiếu tại rạp, bao gồm lịch chiếu và số lượng vé đã bán.

**Quản lý suất chiếu:** Quản lý rạp có toàn quyền quản lý các suất chiếu tại rạp của mình, bao gồm tạo mới, chỉnh sửa, và xóa suất chiếu. Hệ thống cung cấp giao diện quản lý suất chiếu trực quan với timeline view, cho phép quản lý dễ dàng xem và quản lý lịch chiếu theo ngày, tuần, và tháng. Khi tạo suất chiếu mới, quản lý cần chọn phim (chỉ các phim đã được thêm vào rạp), phòng chiếu, ngày chiếu, giờ bắt đầu, và định dạng phim. Hệ thống tự động kiểm tra xung đột thời gian giữa các suất chiếu trong cùng một phòng và cảnh báo quản lý nếu có vấn đề. Quản lý có thể xem thống kê về số lượng vé đã bán cho từng suất chiếu và tỷ lệ lấp đầy phòng chiếu.

**Quản lý phòng chiếu:** Quản lý rạp có toàn quyền quản lý các phòng chiếu trong rạp của mình, bao gồm tạo mới, chỉnh sửa, và xóa phòng chiếu. Khi tạo phòng chiếu mới, quản lý có thể cấu hình tên phòng, loại phòng (2D, 3D, IMAX, 4DX, v.v.), số hàng ghế, số ghế mỗi hàng, và các tiện ích của phòng. Hệ thống tự động tạo sơ đồ ghế dựa trên cấu hình và cho phép quản lý xem sơ đồ ghế tương tác. Quản lý có thể chỉnh sửa thông tin phòng chiếu và xóa phòng chiếu (với điều kiện phòng không có đơn hàng nào). Quản lý có thể xem thông tin chi tiết về từng phòng chiếu, bao gồm số lượng ghế, loại ghế, và các tiện ích.

**Quản lý menu đồ ăn:** Quản lý rạp có thể quản lý menu đồ ăn của rạp mình bằng cách thêm hoặc xóa các combo đồ ăn từ danh sách combo có sẵn trong hệ thống (do quản trị viên tạo). Quản lý có thể xem danh sách tất cả các combo đồ ăn có sẵn và danh sách các combo đang có trong menu của rạp. Quản lý có thể thêm combo vào menu hoặc xóa combo khỏi menu của rạp. Quản lý không thể tạo mới combo đồ ăn, chỉnh sửa thông tin combo, hoặc xóa combo khỏi hệ thống - những chức năng này chỉ dành cho quản trị viên.

**Quản lý đơn hàng:** Quản lý rạp có thể xem tất cả các đơn hàng liên quan đến rạp của mình, bao gồm đơn vé phim và đơn đồ ăn. Quản lý có thể xem chi tiết từng đơn hàng, bao gồm thông tin khách hàng, phim, suất chiếu, ghế ngồi, combo đồ ăn, phương thức thanh toán, và trạng thái thanh toán. Quản lý có thể tìm kiếm và lọc đơn hàng theo nhiều tiêu chí khác nhau như ngày đặt hàng, phim, suất chiếu, trạng thái thanh toán, loại đơn hàng (vé phim hoặc đồ ăn), và thông tin khách hàng. Quản lý có thể xem thống kê về số lượng đơn hàng và doanh thu từ đơn hàng.

**Báo cáo và thống kê:** Quản lý rạp có thể xem các báo cáo về doanh thu, số lượng vé bán ra, và các chỉ số kinh doanh khác của rạp mình. Hệ thống cung cấp các biểu đồ và đồ thị trực quan để giúp quản lý dễ dàng phân tích dữ liệu. Quản lý có thể xuất các báo cáo ra file Excel để phân tích chi tiết hơn. Các báo cáo bao gồm doanh thu theo ngày, tuần, tháng, doanh thu theo phim, doanh thu từ đồ ăn, số lượng vé bán ra, và tỷ lệ lấp đầy phòng chiếu. Tất cả các báo cáo chỉ hiển thị dữ liệu của rạp mà quản lý phụ trách, không bao gồm dữ liệu của các rạp khác.

**Xem bảng giá:** Quản lý rạp có thể xem bảng giá vé cho các loại ghế và định dạng phim, nhưng không thể chỉnh sửa hoặc thay đổi giá. Việc quản lý giá vé chỉ dành cho quản trị viên. Quản lý có thể xem giá vé để tham khảo khi tạo suất chiếu và tư vấn khách hàng.

**Quản lý hoạt động:** Quản lý rạp có thể xem nhật ký hoạt động của rạp mình, bao gồm các thao tác của nhân viên và các sự kiện quan trọng liên quan đến rạp. Điều này giúp quản lý theo dõi và kiểm soát hoạt động của rạp, cũng như phát hiện và xử lý các vấn đề. Quản lý chỉ có thể xem hoạt động của rạp mình, không thể xem hoạt động của các rạp khác.

#### 2.2.1.3. Quản trị viên (Admin)

Quản trị viên là người có quyền cao nhất trong hệ thống, có quyền truy cập vào tất cả các chức năng và quản lý toàn bộ hệ thống. Các quyền và chức năng của quản trị viên bao gồm:

**Quản lý người dùng:** Quản trị viên có thể xem danh sách tất cả người dùng trong hệ thống, bao gồm khách hàng, quản lý rạp, và các quản trị viên khác. Quản trị viên có thể tạo mới tài khoản quản lý rạp và quản trị viên, chỉ định rạp cho quản lý, và quản lý trạng thái tài khoản (kích hoạt, vô hiệu hóa). Quản trị viên có thể xem và cập nhật thông tin của bất kỳ người dùng nào trong hệ thống.

**Quản lý phim:** Quản trị viên có toàn quyền quản lý phim trong hệ thống, bao gồm tạo mới, chỉnh sửa, và xóa phim. Quản trị viên có thể upload poster và trailer phim, quản lý thông tin chi tiết về phim, và cập nhật trạng thái phim.

**Quản lý rạp và phòng chiếu:** Quản trị viên có thể tạo mới, chỉnh sửa, và xóa các cụm rạp và phòng chiếu trong hệ thống. Quản trị viên có thể cấu hình đầy đủ thông tin về rạp và phòng chiếu, bao gồm địa chỉ, tiện ích, và sơ đồ ghế.

**Xem lịch chiếu:** Quản trị viên có thể xem lịch chiếu của tất cả các rạp trong hệ thống để theo dõi và giám sát hoạt động chiếu phim, nhưng không có quyền chỉnh sửa lịch chiếu. Việc quản lý lịch chiếu được giao cho quản lý rạp.

**Quản lý giá vé:** Quản trị viên có thể thiết lập và cập nhật giá vé cho các loại ghế và định dạng phim. Hệ thống quản lý giá vé dựa trên sự kết hợp giữa loại ghế (thường, VIP, couple) và loại phòng chiếu (2D, 3D, IMAX, 4DX, v.v.).

**Quản lý voucher:** Quản trị viên có thể tạo, chỉnh sửa, và xóa voucher giảm giá. Quản trị viên có thể thiết lập các điều kiện sử dụng voucher, phạm vi áp dụng, và phân phối voucher cho khách hàng.

**Quản lý đồ ăn:** Quản trị viên có thể tạo, chỉnh sửa, và xóa các combo đồ ăn trong hệ thống. Quản trị viên có thể upload hình ảnh combo, quản lý giá và mô tả, và đánh dấu combo còn hàng hoặc hết hàng.

**Quản lý đơn hàng:** Quản trị viên có thể xem tất cả các đơn hàng trong hệ thống, không giới hạn bởi rạp. Quản trị viên có thể tìm kiếm, lọc, và xem chi tiết từng đơn hàng, và thực hiện các thao tác quản lý như hủy đơn hàng hoặc hoàn tiền trong các trường hợp đặc biệt.

**Báo cáo và thống kê:** Quản trị viên có thể xem các báo cáo toàn hệ thống về doanh thu, số lượng vé bán ra, và các chỉ số kinh doanh khác. Quản trị viên có thể xuất báo cáo ra file Excel để phân tích chi tiết hơn.

**Quản lý banner:** Quản trị viên có thể tạo, chỉnh sửa, xóa, và quản lý trạng thái (kích hoạt/vô hiệu hóa) các banner hiển thị trên trang chủ. Banner chỉ có các thông tin cơ bản: tên banner và URL hình ảnh.

**Quản lý đánh giá:** Quản trị viên có thể xem tất cả các đánh giá trong hệ thống, tìm kiếm và lọc đánh giá theo nhiều tiêu chí. Khi phát hiện các đánh giá không phù hợp, quản trị viên có thể ẩn đánh giá đó để không hiển thị công khai trên hệ thống. Hệ thống không xóa hoàn toàn đánh giá, chỉ ẩn để đảm bảo tính minh bạch.

**Quản lý hoạt động hệ thống:** Quản trị viên có thể xem nhật ký hoạt động của hệ thống, bao gồm các thao tác của người dùng và các sự kiện quan trọng. Điều này giúp quản trị viên theo dõi và kiểm soát hoạt động của hệ thống, cũng như phát hiện và xử lý các vấn đề bảo mật.

### 2.2.2. Các chức năng chính

Hệ thống cung cấp một bộ chức năng đầy đủ và toàn diện để đáp ứng nhu cầu của cả khách hàng và quản lý, được tổ chức thành các module chính với các tính năng chi tiết như sau. Tất cả các chức năng được mô tả dưới đây đều được triển khai thực tế trong hệ thống và có thể được kiểm chứng qua mã nguồn. Các module quan trọng được mô tả chi tiết, các module phụ trợ được mô tả ngắn gọn:

#### 2.2.2.1. Module Xác thực và Quản lý Người dùng

Module Xác thực và Quản lý Người dùng là nền tảng của hệ thống, đảm bảo tính bảo mật và quản lý hiệu quả các tài khoản người dùng. Module này cung cấp các chức năng đăng ký tài khoản mới với quy trình xác thực email nghiêm ngặt. Khi người dùng đăng ký, hệ thống sẽ gửi một mã OTP (One-Time Password) đến email đã đăng ký để xác minh tính hợp lệ của địa chỉ email. Chỉ sau khi xác thực email thành công, tài khoản mới được kích hoạt và người dùng có thể sử dụng các chức năng của hệ thống.

Module hỗ trợ đăng nhập đa dạng với hai phương thức chính: đăng nhập bằng tài khoản hệ thống (username/password) và đăng nhập thông qua Google OAuth 2.0. Việc tích hợp Google OAuth mang lại sự thuận tiện cho người dùng, cho phép họ đăng nhập nhanh chóng mà không cần nhớ thêm một bộ thông tin đăng nhập mới. Hệ thống sử dụng JWT (JSON Web Token) để quản lý phiên đăng nhập, đảm bảo tính bảo mật và hiệu quả. JWT token có thời gian hết hạn, yêu cầu người dùng đăng nhập lại sau một khoảng thời gian nhất định để tăng cường bảo mật.

Chức năng quên mật khẩu được thực hiện thông qua email OTP. Khi người dùng yêu cầu đặt lại mật khẩu, hệ thống sẽ gửi một mã OTP đến email đã đăng ký. Người dùng nhập mã OTP để xác thực danh tính, sau đó có thể đặt mật khẩu mới. Quy trình này đảm bảo rằng chỉ chủ sở hữu email mới có thể đặt lại mật khẩu.

Module cũng cung cấp các chức năng quản lý thông tin cá nhân, cho phép người dùng xem và cập nhật thông tin của mình như họ tên, email, số điện thoại, ngày sinh, địa chỉ, và avatar. Hệ thống đảm bảo tính nhất quán của dữ liệu và cung cấp các validation để đảm bảo thông tin nhập vào là hợp lệ.

#### 2.2.2.2. Module Quản lý Phim

Module Quản lý Phim là trung tâm của hệ thống, quản lý toàn bộ thông tin về các bộ phim được chiếu tại rạp. Module này cung cấp giao diện quản lý phim toàn diện cho quản trị viên, cho phép thêm mới, chỉnh sửa, và xóa phim một cách dễ dàng. Khi thêm phim mới, quản trị viên có thể nhập đầy đủ thông tin về phim bao gồm tiêu đề (tiếng Việt và tiếng Anh), mô tả chi tiết, diễn viên, đạo diễn, thể loại (có thể chọn nhiều thể loại), độ tuổi cho phép (P, C13, C16, C18), thời lượng phim, ngày khởi chiếu, và ngày kết thúc.

Module hỗ trợ upload và quản lý poster phim, cho phép quản trị viên upload hình ảnh poster chất lượng cao để hiển thị trên website. Hệ thống tích hợp với Cloudinary để lưu trữ và tối ưu hóa hình ảnh, đảm bảo tốc độ tải nhanh và chất lượng hình ảnh tốt trên mọi thiết bị. Module cũng hỗ trợ upload trailer phim (URL video), cho phép khách hàng xem trước phim trước khi quyết định đặt vé.

Hệ thống quản lý trạng thái phim một cách linh hoạt với ba trạng thái chính: "đang chiếu" (NOW_SHOWING), "sắp chiếu" (COMING_SOON), và "đã kết thúc" (ENDED). Hệ thống tự động cập nhật trạng thái phim dựa trên ngày khởi chiếu và ngày kết thúc, đảm bảo thông tin luôn chính xác và cập nhật.

Module cung cấp các công cụ tìm kiếm và lọc phim mạnh mẽ, cho phép khách hàng tìm kiếm phim theo tên, thể loại, rạp chiếu, ngày chiếu, và định dạng phim. Hệ thống cũng cung cấp các bộ lọc nâng cao để khách hàng có thể tìm được phim phù hợp với sở thích của mình một cách nhanh chóng.

Module cung cấp thống kê chi tiết về số lượng vé đã bán cho từng phim, giúp quản lý đánh giá mức độ phổ biến của từng bộ phim và đưa ra các quyết định kinh doanh phù hợp.

#### 2.2.2.3. Module Quản lý Rạp và Phòng chiếu

Module này quản lý toàn bộ cơ sở hạ tầng của hệ thống rạp chiếu phim. Quản trị viên có thể tạo mới, chỉnh sửa, và xóa các cụm rạp với đầy đủ thông tin bao gồm tên rạp, địa chỉ chi tiết, số điện thoại, email, và các tiện ích. Module quản lý phòng chiếu với khả năng cấu hình số hàng ghế, số ghế mỗi hàng, loại phòng (2D, 3D, IMAX, 4DX), và loại ghế (thường, VIP, couple). Hệ thống tự động tạo sơ đồ ghế dựa trên cấu hình. Quản lý rạp có toàn quyền quản lý phòng chiếu trong rạp của mình, bao gồm tạo mới, chỉnh sửa, và xóa phòng chiếu.

#### 2.2.2.4. Module Quản lý Suất chiếu

Module Quản lý Suất chiếu là một trong những module quan trọng nhất của hệ thống, quản lý lịch chiếu phim tại các rạp. Module này cung cấp giao diện quản lý lịch chiếu trực quan và mạnh mẽ cho quản lý rạp, cho phép tạo mới, chỉnh sửa, và xóa suất chiếu một cách dễ dàng.

Khi tạo suất chiếu mới, quản lý rạp cần chọn phim (chỉ các phim đã được thêm vào rạp), phòng chiếu, ngày chiếu, giờ bắt đầu, ngôn ngữ (Phụ đề, Lồng tiếng), và định dạng phim (2D, 3D, IMAX, 4DX, v.v.). Hệ thống tự động tính toán thời gian kết thúc dựa trên thời lượng phim và thời gian dọn dẹp giữa các suất chiếu. Module tích hợp với Drools Business Rules Engine để tự động kiểm tra xung đột thời gian khi tạo suất chiếu mới. Hệ thống sẽ cảnh báo quản lý nếu có xung đột với các suất chiếu khác trong cùng phòng, đảm bảo không có hai suất chiếu cùng diễn ra trong một phòng tại cùng một thời điểm.

Module cung cấp giao diện xem lịch chiếu theo nhiều định dạng khác nhau: xem theo ngày để thấy tất cả suất chiếu trong ngày, xem theo tuần để có cái nhìn tổng quan về lịch chiếu trong tuần, và xem theo tháng để lập kế hoạch dài hạn. Giao diện hiển thị lịch chiếu dưới dạng timeline, cho phép quản lý dễ dàng nhận biết các khoảng trống trong lịch chiếu và tối ưu hóa việc sử dụng phòng chiếu.

Module cung cấp thống kê chi tiết về số lượng vé đã bán cho từng suất chiếu, giúp quản lý đánh giá hiệu quả của từng suất chiếu và điều chỉnh lịch chiếu phù hợp. Hệ thống cũng cung cấp thông tin về số ghế còn trống, tỷ lệ lấp đầy, và doanh thu của từng suất chiếu.

Đối với quản trị viên, module chỉ cung cấp quyền xem lịch chiếu để theo dõi và giám sát hoạt động chiếu phim trên toàn hệ thống, nhưng không có quyền chỉnh sửa để đảm bảo tính phân quyền và trách nhiệm rõ ràng.

#### 2.2.2.5. Module Đặt vé và Chọn ghế

Module Đặt vé và Chọn ghế là module cốt lõi của hệ thống, cung cấp trải nghiệm đặt vé trực quan và thuận tiện cho khách hàng. Module này được thiết kế với giao diện người dùng thân thiện, đảm bảo quy trình đặt vé diễn ra mượt mà và nhanh chóng.

Quy trình đặt vé bắt đầu từ việc khách hàng chọn phim và suất chiếu. Hệ thống hiển thị danh sách các phim đang chiếu và sắp chiếu với đầy đủ thông tin và hình ảnh poster. Khách hàng có thể lọc phim theo nhiều tiêu chí như rạp chiếu, ngày chiếu, định dạng phim, và thể loại. Sau khi chọn phim, khách hàng được hiển thị danh sách các suất chiếu có sẵn với thông tin về thời gian, phòng chiếu, và định dạng. Hệ thống cho phép khách hàng lọc suất chiếu theo ngày, và khi chọn "Tất cả", hệ thống sẽ hiển thị tất cả suất chiếu được nhóm theo ngày.

Khi khách hàng chọn suất chiếu, hệ thống hiển thị sơ đồ ghế tương tác với đầy đủ thông tin về vị trí và loại ghế. Sơ đồ ghế được thiết kế trực quan với màu sắc rõ ràng để phân biệt các trạng thái ghế: ghế trống (có thể chọn), ghế đã được chọn bởi người khác (không thể chọn), ghế đã được bán (không thể chọn), và ghế VIP (có giá cao hơn). Hệ thống hiển thị giá vé cho từng loại ghế, giúp khách hàng đưa ra quyết định phù hợp.

Module sử dụng WebSocket để cập nhật trạng thái ghế theo thời gian thực, đảm bảo rằng khi một khách hàng chọn ghế, tất cả khách hàng khác đang xem cùng suất chiếu sẽ thấy ghế đó đã được chọn ngay lập tức. Điều này ngăn chặn tình trạng nhiều người cùng chọn một ghế và tạo ra xung đột. Hệ thống sử dụng session ID để phân biệt giữa các người dùng và chỉ cho phép người chọn ghế mới có thể bỏ chọn ghế đó. Hệ thống cũng tự động giải phóng ghế sau một khoảng thời gian nhất định (2 phút) nếu khách hàng không hoàn tất việc thanh toán, đảm bảo ghế không bị giữ quá lâu.

Sau khi chọn ghế, khách hàng có thể đặt combo đồ ăn kèm theo vé. Module hiển thị danh sách các combo có sẵn với hình ảnh, mô tả, và giá. Khách hàng có thể chọn số lượng combo và xem tổng tiền được cập nhật ngay lập tức. Hệ thống cũng cho phép khách hàng áp dụng voucher giảm giá nếu có, với khả năng tự động tính toán số tiền được giảm và tổng tiền cuối cùng.

Trước khi thanh toán, hệ thống hiển thị một trang xác nhận với đầy đủ thông tin về đơn hàng: thông tin phim, suất chiếu, ghế đã chọn, combo đồ ăn, voucher đã áp dụng, và tổng tiền. Khách hàng có thể xem lại và chỉnh sửa trước khi xác nhận đặt vé.

#### 2.2.2.6. Module Thanh toán

Module Thanh toán là module quan trọng đảm bảo việc xử lý các giao dịch thanh toán một cách an toàn và hiệu quả. Module này tích hợp với hai cổng thanh toán phổ biến tại Việt Nam là ZaloPay và MoMo, cung cấp nhiều lựa chọn thanh toán cho khách hàng.

Khi khách hàng xác nhận đặt vé, hệ thống tạo một đơn hàng với trạng thái "PENDING" (chờ thanh toán) và gọi API của cổng thanh toán được chọn để tạo yêu cầu thanh toán. Hệ thống truyền đầy đủ thông tin về đơn hàng bao gồm số tiền, mô tả đơn hàng, và thông tin khách hàng. Cổng thanh toán xử lý yêu cầu và trả về URL thanh toán, hệ thống sẽ chuyển hướng khách hàng đến trang thanh toán của cổng thanh toán.

Sau khi khách hàng thực hiện thanh toán trên trang của cổng thanh toán, cổng thanh toán sẽ gửi callback về server để thông báo kết quả thanh toán. Module xử lý callback một cách an toàn bằng cách kiểm tra signature để đảm bảo callback đến từ cổng thanh toán hợp lệ. Nếu thanh toán thành công, hệ thống cập nhật trạng thái đơn hàng thành "PAID" (đã thanh toán), tạo vé và ticket tương ứng, gửi thông báo xác nhận cho khách hàng, và chỉ khi đó mới xóa voucher khỏi danh sách voucher của khách hàng (nếu có sử dụng voucher). Điều này đảm bảo voucher chỉ được sử dụng khi thanh toán thực sự thành công.

Module quản lý trạng thái thanh toán một cách chi tiết với các trạng thái: "PENDING" (chờ thanh toán), "PAID" (đã thanh toán), "FAILED" (thanh toán thất bại), và "REFUNDED" (đã hoàn tiền). Hệ thống tự động cập nhật trạng thái dựa trên kết quả từ cổng thanh toán và cung cấp cơ chế để xử lý các trường hợp thanh toán thất bại hoặc cần hoàn tiền.

Module cung cấp chức năng gửi thông báo xác nhận thanh toán cho khách hàng qua nhiều kênh: thông báo real-time trên website, email xác nhận với thông tin chi tiết về đơn hàng, và mã QR code để sử dụng khi đến rạp. Hệ thống cũng cung cấp cơ chế để xử lý hoàn tiền trong các trường hợp đặc biệt như hủy đơn hàng hoặc có vấn đề với dịch vụ.

#### 2.2.2.7. Module Quản lý Đơn hàng

Module Quản lý Đơn hàng cung cấp các công cụ toàn diện để quản lý và theo dõi tất cả các đơn hàng trong hệ thống. Module này phục vụ cả khách hàng, quản lý rạp, và quản trị viên với các quyền truy cập khác nhau.

Đối với khách hàng, module cung cấp trang "Lịch sử đơn hàng" cho phép xem tất cả các đơn hàng của mình, bao gồm cả đơn hàng đã hoàn thành và đang chờ thanh toán. Khách hàng có thể xem chi tiết từng đơn hàng với đầy đủ thông tin: thông tin phim (tên phim, poster), thông tin suất chiếu (ngày, giờ, phòng chiếu), thông tin ghế ngồi (số ghế, loại ghế), thông tin combo đồ ăn (tên combo, số lượng, giá đơn vị, tổng giá), thông tin thanh toán (phương thức thanh toán, số tiền, trạng thái), và mã QR code để sử dụng khi đến rạp.

Module cung cấp mã QR code duy nhất cho mỗi vé hoặc đơn hàng, chứa đầy đủ thông tin về đơn hàng và có thể được quét tại rạp để xác thực và sử dụng. Mã QR code được hiển thị rõ ràng trên trang chi tiết đơn hàng và có thể được tải xuống để lưu trữ trên điện thoại.

Đối với quản lý rạp, module cung cấp giao diện quản lý đơn hàng với khả năng xem tất cả các đơn hàng liên quan đến rạp của mình, bao gồm cả đơn vé và đơn đồ ăn. Quản lý có thể tìm kiếm và lọc đơn hàng theo nhiều tiêu chí: ngày đặt hàng, phim, suất chiếu, trạng thái thanh toán, loại đơn hàng (vé phim hoặc đồ ăn), và thông tin khách hàng. Module cung cấp các công cụ tìm kiếm mạnh mẽ, cho phép quản lý nhanh chóng tìm được đơn hàng cần thiết.

Đối với quản trị viên, module cung cấp quyền truy cập toàn bộ đơn hàng trong hệ thống, không giới hạn bởi rạp. Quản trị viên có thể xem, tìm kiếm, và lọc đơn hàng trên toàn hệ thống, xem chi tiết từng đơn hàng, và thực hiện các thao tác quản lý như hủy đơn hàng hoặc hoàn tiền trong các trường hợp đặc biệt.

Module cung cấp các báo cáo và thống kê về đơn hàng, giúp quản lý và quản trị viên đánh giá hiệu quả kinh doanh và đưa ra các quyết định phù hợp.

#### 2.2.2.8. Module Quản lý Voucher và Khuyến mãi

Module này cho phép quản trị viên tạo và quản lý các voucher giảm giá với nhiều tùy chọn: mã voucher, loại giảm giá (phần trăm hoặc số tiền cố định), giá trị giảm, giá trị đơn hàng tối thiểu, thời gian hiệu lực, số lượng voucher, và phạm vi áp dụng (toàn hệ thống hoặc rạp cụ thể). Voucher có thể được phân phối công khai hoặc gán cho khách hàng cụ thể. Hệ thống tự động kiểm tra tính hợp lệ khi khách hàng sử dụng voucher và chỉ xóa voucher khỏi danh sách của khách hàng sau khi thanh toán thành công.

#### 2.2.2.9. Module Quản lý Đồ ăn

Module này cho phép quản trị viên tạo và quản lý các combo đồ ăn với thông tin: tên combo, mô tả, giá, hình ảnh (upload qua Cloudinary), và tình trạng còn hàng. Khách hàng có thể đặt đồ ăn kèm theo vé hoặc đặt độc lập. Quản lý rạp có thể thêm/xóa combo vào menu của rạp mình từ danh sách combo có sẵn trong hệ thống.

#### 2.2.2.10. Module Báo cáo và Thống kê

Module Báo cáo và Thống kê là công cụ mạnh mẽ để phân tích dữ liệu kinh doanh và đưa ra các quyết định dựa trên dữ liệu. Module này cung cấp các báo cáo chi tiết và trực quan cho cả quản lý rạp và quản trị viên.

Module cung cấp báo cáo doanh thu theo nhiều khoảng thời gian khác nhau: theo ngày để theo dõi doanh thu hàng ngày, theo tuần để có cái nhìn tổng quan về doanh thu trong tuần, theo tháng để đánh giá hiệu quả kinh doanh trong tháng, và theo năm để lập kế hoạch dài hạn. Mỗi báo cáo có thể được lọc theo rạp, phim, hoặc các tiêu chí khác để có được thông tin chi tiết hơn.

Module cung cấp báo cáo số lượng đơn hàng (tổng số đơn hàng, không chỉ đếm vé), cho phép quản lý và quản trị viên đánh giá mức độ phổ biến của từng phim và suất chiếu. Báo cáo này giúp xác định các phim và suất chiếu có hiệu quả cao và điều chỉnh lịch chiếu phù hợp.

Module cung cấp báo cáo doanh thu theo phim, cho phép đánh giá hiệu quả kinh doanh của từng bộ phim. Báo cáo này giúp quản lý quyết định nên tiếp tục chiếu phim nào và dừng chiếu phim nào. Module cũng cung cấp báo cáo doanh thu theo rạp, cho phép so sánh hiệu quả kinh doanh giữa các rạp khác nhau.

Module cung cấp báo cáo doanh thu từ đồ ăn, cho phép đánh giá hiệu quả của phần kinh doanh đồ ăn. Báo cáo này giúp quản lý điều chỉnh menu và giá cả để tối ưu hóa doanh thu.

Tất cả các báo cáo được hiển thị dưới dạng biểu đồ và đồ thị trực quan, sử dụng Recharts để tạo các biểu đồ đẹp mắt và dễ hiểu. Module cung cấp nhiều loại biểu đồ khác nhau: biểu đồ cột để so sánh doanh thu giữa các khoảng thời gian, biểu đồ đường để theo dõi xu hướng doanh thu, và biểu đồ tròn để phân tích tỷ lệ doanh thu từ các nguồn khác nhau.

Module cung cấp chức năng xuất báo cáo ra file Excel, cho phép quản lý và quản trị viên tải xuống và phân tích chi tiết hơn. File Excel chứa đầy đủ dữ liệu với các định dạng phù hợp, giúp dễ dàng tạo các báo cáo tùy chỉnh.

#### 2.2.2.11. Module Đánh giá và Phản hồi

Module này cho phép khách hàng đánh giá phim bằng sao (1-5 sao) và viết nhận xét sau khi đã xem phim (đã đặt vé và thanh toán thành công). Khách hàng có thể xem đánh giá của người khác và đánh dấu phim yêu thích. Quản trị viên có thể xem, tìm kiếm, lọc đánh giá, và ẩn đánh giá không phù hợp (không xóa hoàn toàn để đảm bảo tính minh bạch).

#### 2.2.2.12. Module Thông báo

Module này cung cấp thông báo real-time qua WebSocket (toast notification), thông báo qua email (xác nhận đặt vé, thanh toán, OTP), và quản lý lịch sử thông báo trong database. Người dùng có thể xem lại các thông báo đã nhận và đánh dấu đã đọc.

#### 2.2.2.13. Module Quản lý Banner

Module này cho phép quản trị viên quản lý các banner hiển thị trên trang chủ. Banner chỉ có các thông tin cơ bản: tên banner và URL hình ảnh. Quản trị viên có thể tạo, chỉnh sửa, xóa banner, và bật/tắt trạng thái hiển thị (isActive). Banner đang hoạt động được hiển thị công khai trên trang chủ.

#### 2.2.2.14. Module Quản lý Giá vé

Module này cho phép quản trị viên thiết lập và cập nhật giá vé dựa trên sự kết hợp giữa loại ghế (thường, VIP, couple) và loại phòng chiếu (2D, 3D, IMAX, 4DX). Quản trị viên có thể cập nhật giá cho nhiều sự kết hợp cùng lúc. Tất cả thay đổi giá vé được ghi vào nhật ký hoạt động. Bảng giá được hiển thị công khai, quản lý rạp chỉ có thể xem để tham khảo.

#### 2.2.2.15. Module Quản lý Hoạt động

Module này ghi lại tự động tất cả các thao tác quan trọng trong hệ thống (tạo, cập nhật, xóa phim, suất chiếu, phòng chiếu, giá vé, voucher, v.v.) với thông tin: người thực hiện, thời gian, loại hành động, đối tượng, và mô tả. Quản trị viên có thể xem tất cả hoạt động, quản lý rạp chỉ xem hoạt động của rạp mình. Cả hai đều có thể xóa hoạt động để dọn dẹp.

Tất cả các module này được tích hợp chặt chẽ với nhau để tạo ra một hệ thống hoàn chỉnh và thống nhất, đáp ứng đầy đủ nhu cầu của cả khách hàng và quản lý trong việc đặt vé và quản lý rạp chiếu phim. Mỗi module được thiết kế với các tính năng chi tiết và toàn diện, đảm bảo hệ thống hoạt động hiệu quả và mang lại trải nghiệm tốt nhất cho người dùng.
