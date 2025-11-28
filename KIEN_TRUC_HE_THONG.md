# CHƯƠNG 1: KIẾN TRÚC HỆ THỐNG

## 1.1. Kiến trúc hệ thống

Hệ thống đặt vé xem phim trực tuyến được thiết kế và triển khai dựa trên mô hình kiến trúc **Client-Server** với kiến trúc phân tầng (Layered Architecture), bao gồm ba tầng chính: tầng trình bày (Presentation Layer), tầng xử lý nghiệp vụ (Business Logic Layer) và tầng dữ liệu (Data Layer). Kiến trúc này đảm bảo tính phân tách rõ ràng giữa các thành phần, tạo điều kiện cho việc bảo trì, mở rộng và tái sử dụng mã nguồn.

### 1.1.1. Tầng Presentation (Frontend)

Tầng trình bày đóng vai trò là giao diện tương tác trực tiếp với người dùng cuối, chịu trách nhiệm hiển thị thông tin và xử lý các tương tác từ phía client. Tầng này được xây dựng bằng công nghệ **React.js** kết hợp với **Vite** làm công cụ build và development server.

Các chức năng chính của tầng Presentation bao gồm:

- **Hiển thị dữ liệu**: Trình bày danh sách phim đang chiếu và sắp chiếu, thông tin lịch chiếu, sơ đồ ghế ngồi trong phòng chiếu, và các thông tin liên quan khác.

- **Xử lý giao dịch**: Quản lý quy trình đặt vé từ việc chọn phim, chọn suất chiếu, chọn ghế ngồi, đến việc xác nhận và thanh toán đơn hàng.

- **Quản lý đơn hàng**: Cung cấp giao diện để người dùng xem lịch sử đặt vé, chi tiết đơn hàng, và trạng thái giao dịch.

- **Dashboard quản trị**: Cung cấp các giao diện quản lý dành cho quản trị viên (Admin) và quản lý rạp (Manager), bao gồm các chức năng quản lý phim, rạp, lịch chiếu, đơn hàng, và báo cáo thống kê.

Tầng Presentation giao tiếp với tầng Business Logic thông qua các API RESTful, sử dụng giao thức HTTP/HTTPS để truyền tải dữ liệu dưới định dạng JSON.

### 1.1.2. Tầng Business Logic (Backend)

Tầng xử lý nghiệp vụ là trung tâm xử lý logic của hệ thống, chịu trách nhiệm xử lý các yêu cầu từ tầng Presentation, thực thi các quy tắc nghiệp vụ, xác thực người dùng, và quản lý bảo mật. Tầng này được xây dựng trên nền tảng **Spring Boot 3.5.7**, một framework Java phổ biến cho các ứng dụng enterprise.

Các chức năng chính của tầng Business Logic bao gồm:

- **API RESTful**: Cung cấp các endpoint API để thực hiện các thao tác CRUD (Create, Read, Update, Delete) trên các tài nguyên của hệ thống như phim, rạp, lịch chiếu, đơn hàng, người dùng, và các đối tượng khác.

- **Xác thực và phân quyền**: Triển khai cơ chế xác thực dựa trên JWT (JSON Web Token) và Spring Security, hỗ trợ phân quyền theo vai trò (Role-Based Access Control) với ba cấp độ: ADMIN, MANAGER, và USER.

- **Xử lý thanh toán**: Tích hợp với các cổng thanh toán điện tử như ZaloPay và MoMo để xử lý các giao dịch thanh toán trực tuyến, bao gồm xử lý callback và xác minh giao dịch.

- **Dịch vụ email**: Sử dụng JavaMail để gửi email xác nhận đơn hàng, mã OTP (One-Time Password) cho việc xác thực tài khoản, và các thông báo quan trọng khác.

- **Cập nhật thời gian thực**: Triển khai WebSocket với giao thức STOMP để cung cấp cập nhật thời gian thực về trạng thái ghế ngồi, đảm bảo nhiều người dùng không thể đặt cùng một ghế đồng thời.

- **Business Rules Engine**: Sử dụng Drools để quản lý các quy tắc nghiệp vụ động, bao gồm quy tắc định giá, quy tắc xác thực lịch chiếu, và các quy tắc nghiệp vụ khác.

Tầng Business Logic giao tiếp với tầng Data thông qua Spring Data JPA và Hibernate ORM để thực hiện các thao tác truy vấn và cập nhật dữ liệu.

### 1.1.3. Tầng Data (Database)

Tầng dữ liệu chịu trách nhiệm lưu trữ và quản lý toàn bộ dữ liệu của hệ thống. Tầng này sử dụng hệ quản trị cơ sở dữ liệu quan hệ **MySQL** để lưu trữ dữ liệu một cách có cấu trúc và đảm bảo tính toàn vẹn dữ liệu.

Các chức năng chính của tầng Data bao gồm:

- **Lưu trữ dữ liệu**: Lưu trữ thông tin về người dùng, phim, rạp chiếu phim, phòng chiếu, lịch chiếu, ghế ngồi, đơn hàng, vé, combo đồ ăn, voucher, đánh giá, banner, và nhật ký hoạt động.

- **Quản lý quan hệ**: Duy trì các mối quan hệ giữa các thực thể trong cơ sở dữ liệu thông qua các ràng buộc khóa ngoại (Foreign Key Constraints), đảm bảo tính nhất quán và toàn vẹn dữ liệu.

- **Đảm bảo tính toàn vẹn**: Sử dụng các ràng buộc (constraints) như NOT NULL, UNIQUE, CHECK, và FOREIGN KEY để đảm bảo dữ liệu được lưu trữ chính xác và tuân thủ các quy tắc nghiệp vụ.

- **Tối ưu hiệu suất**: Sử dụng các chỉ mục (indexes) trên các cột thường được sử dụng trong các truy vấn để cải thiện hiệu suất truy vấn dữ liệu.

### 1.1.4. Kiến trúc giao tiếp giữa các tầng

Hệ thống sử dụng các giao thức và công nghệ sau để đảm bảo giao tiếp hiệu quả giữa các tầng:

- **RESTful API**: Giao tiếp chính giữa tầng Presentation và tầng Business Logic được thực hiện thông qua các API RESTful sử dụng giao thức HTTP/HTTPS. Dữ liệu được truyền tải dưới định dạng JSON, đảm bảo tính linh hoạt và dễ dàng xử lý.

- **WebSocket (STOMP)**: Để cung cấp cập nhật thời gian thực về trạng thái ghế ngồi và các thông báo quan trọng, hệ thống sử dụng WebSocket với giao thức STOMP (Simple Text Oriented Messaging Protocol), cho phép giao tiếp hai chiều giữa client và server.

- **JWT Token**: Hệ thống sử dụng JWT (JSON Web Token) để xác thực người dùng một cách stateless, cho phép server xác minh danh tính người dùng mà không cần lưu trữ session trên server. Token được gửi kèm trong header của mỗi request từ client.

- **CORS (Cross-Origin Resource Sharing)**: Để cho phép frontend chạy trên một domain khác với backend có thể gọi API, hệ thống được cấu hình CORS để cho phép các request từ domain của frontend.

## 1.2. Khái quát về công nghệ

### 1.2.1. Front End

#### Framework và Thư viện chính

**React 19** là framework JavaScript được lựa chọn để xây dựng giao diện người dùng của hệ thống. React được phát triển bởi Facebook và được sử dụng rộng rãi trong việc xây dựng các ứng dụng web hiện đại nhờ vào các đặc điểm nổi bật sau:

- **Kiến trúc dựa trên Component**: React cho phép chia nhỏ giao diện thành các component độc lập, có thể tái sử dụng, giúp mã nguồn dễ bảo trì và mở rộng.

- **Virtual DOM**: React sử dụng Virtual DOM để tối ưu hóa việc cập nhật giao diện, chỉ render lại những phần thay đổi, giúp cải thiện đáng kể hiệu suất của ứng dụng.

- **React Hooks**: Hệ thống sử dụng các React Hooks như `useState`, `useEffect`, `useMemo`, và `useRef` để quản lý state và side effects trong các functional components, giúp mã nguồn ngắn gọn và dễ hiểu hơn so với class components.

**Vite** được sử dụng làm build tool và development server thay vì các công cụ truyền thống như Webpack. Vite được lựa chọn nhờ các ưu điểm sau:

- **Hot Module Replacement (HMR) nhanh**: Vite cung cấp HMR cực kỳ nhanh, cho phép cập nhật thay đổi trong mã nguồn ngay lập tức trên trình duyệt mà không cần reload toàn bộ trang.

- **Tree-shaking và Code Splitting tự động**: Vite tự động loại bỏ mã không sử dụng và chia nhỏ bundle thành các chunk nhỏ hơn, giúp giảm kích thước file và cải thiện thời gian tải trang.

- **Build tối ưu cho production**: Vite sử dụng Rollup để build production, tạo ra các file tối ưu với kích thước nhỏ và hiệu suất cao.

**React Router DOM** được sử dụng để quản lý routing trong ứng dụng Single Page Application (SPA):

- **Client-side routing**: Cho phép điều hướng giữa các trang mà không cần reload lại toàn bộ trang, tạo trải nghiệm người dùng mượt mà.

- **Protected routes**: Hỗ trợ bảo vệ các route yêu cầu xác thực, tự động chuyển hướng người dùng chưa đăng nhập đến trang đăng nhập.

- **Dynamic routing**: Cho phép truyền tham số trong URL, ví dụ như `/movie/:id` để hiển thị chi tiết phim cụ thể.

#### Styling

**Tailwind CSS** là framework CSS utility-first được sử dụng làm công cụ styling chính của hệ thống:

- **Responsive design**: Tailwind cung cấp các breakpoints sẵn có (sm, md, lg, xl, 2xl) để xây dựng giao diện responsive, tự động điều chỉnh layout theo kích thước màn hình.

- **Custom theme configuration**: Cho phép tùy chỉnh màu sắc, font chữ, spacing, và các giá trị khác thông qua file cấu hình `tailwind.config.js`, đảm bảo tính nhất quán trong thiết kế.

- **JIT (Just-In-Time) compilation**: Tailwind chỉ generate CSS cho các class được sử dụng trong mã nguồn, giúp giảm kích thước file CSS cuối cùng.

**CSS Modules** được sử dụng để tạo scoped styling cho các component:

- **Tách biệt styles**: Mỗi component có file CSS riêng, tránh xung đột tên class giữa các component.

- **Tối ưu bundle size**: CSS chỉ được load khi component được sử dụng, giúp giảm kích thước bundle ban đầu.

#### State Management và API

**Axios** là HTTP client được sử dụng để thực hiện các request API từ frontend đến backend:

- **Interceptors**: Axios cho phép thiết lập interceptors để tự động thêm JWT token vào header của mỗi request, và xử lý lỗi tập trung khi nhận được response.

- **Request/Response transformation**: Cho phép chuyển đổi dữ liệu trước khi gửi request hoặc sau khi nhận response, đảm bảo định dạng dữ liệu phù hợp.

- **Error handling tập trung**: Có thể xử lý lỗi một cách tập trung, ví dụ như tự động đăng xuất người dùng khi token hết hạn.

**Local Storage** được sử dụng để lưu trữ dữ liệu phía client:

- **JWT token**: Lưu trữ token xác thực để sử dụng trong các request tiếp theo.

- **User data**: Lưu trữ thông tin người dùng đã đăng nhập để hiển thị trên giao diện mà không cần gọi API mỗi lần.

- **Preferences**: Lưu trữ các tùy chọn của người dùng như theme, ngôn ngữ, và các cài đặt khác.

#### Real-time Communication

**SockJS** và **STOMP** được sử dụng để triển khai giao tiếp thời gian thực:

- **SockJS**: Thư viện JavaScript cung cấp WebSocket-like object, tự động fallback về các phương thức khác nếu WebSocket không được hỗ trợ.

- **STOMP (Simple Text Oriented Messaging Protocol)**: Giao thức messaging trên WebSocket, cho phép subscribe và unsubscribe các topic để nhận thông báo cụ thể.

- **Real-time seat availability**: Khi một người dùng đặt ghế, các người dùng khác đang xem cùng một suất chiếu sẽ nhận được cập nhật ngay lập tức về trạng thái ghế đó.

- **Notification system**: Hệ thống thông báo real-time cho người dùng về các sự kiện quan trọng như xác nhận đơn hàng, thay đổi lịch chiếu, v.v.

#### UI Components và Utilities

**Recharts** là thư viện biểu đồ được sử dụng trong dashboard quản trị:

- Cung cấp các loại biểu đồ như line chart, bar chart, pie chart để hiển thị dữ liệu thống kê về doanh thu, số lượng đơn hàng, và các chỉ số khác.

- Responsive và customizable, cho phép tùy chỉnh màu sắc, kích thước, và các thuộc tính khác của biểu đồ.

**QRCode.react** được sử dụng để tạo và hiển thị QR code cho vé điện tử trên frontend.

**ExcelJS** và **XLSX** được sử dụng để export dữ liệu ra file Excel, phục vụ cho chức năng xuất báo cáo trong dashboard quản trị.

#### Cấu trúc thư mục Frontend

Cấu trúc thư mục của frontend được tổ chức theo nguyên tắc phân tách rõ ràng giữa các thành phần:

```
frontend/
├── src/
│   ├── components/          # Các component có thể tái sử dụng
│   │   ├── AdminDashboard/  # Các component quản lý dành cho Admin
│   │   ├── ManagerDashboard/# Các component quản lý dành cho Manager
│   │   ├── Common/          # Các component dùng chung
│   │   └── ...
│   ├── pages/               # Các component trang
│   ├── services/            # Lớp service để gọi API
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # Các file CSS
│   │   ├── admin/          # CSS dành riêng cho admin
│   │   ├── components/     # CSS cho các component
│   │   └── pages/          # CSS cho các trang
│   └── utils/               # Các hàm tiện ích
├── public/                  # Các tài nguyên tĩnh
└── package.json            # File cấu hình dependencies
```

### 1.2.2. Back End

#### Framework và Core

**Spring Boot 3.5.7** là framework Java được lựa chọn để xây dựng backend của hệ thống. Spring Boot là một phần của hệ sinh thái Spring Framework, được thiết kế để đơn giản hóa việc phát triển các ứng dụng Java enterprise:

- **Auto-configuration**: Spring Boot tự động cấu hình các thành phần dựa trên các dependency có trong classpath, giảm thiểu việc cấu hình thủ công.

- **Embedded Tomcat server**: Spring Boot tích hợp sẵn Tomcat server, cho phép chạy ứng dụng như một standalone application mà không cần cài đặt server riêng.

- **Production-ready features**: Cung cấp các tính năng sẵn có như health checks, metrics, và externalized configuration, giúp dễ dàng triển khai và vận hành trong môi trường production.

**Java 17** là phiên bản Java được sử dụng để phát triển backend:

- **Records**: Cung cấp cú pháp ngắn gọn để định nghĩa các class immutable, phù hợp cho các DTO (Data Transfer Object).

- **Pattern Matching**: Cải thiện khả năng xử lý các cấu trúc dữ liệu phức tạp.

- **Sealed classes**: Cho phép kiểm soát các class nào có thể kế thừa từ một class cụ thể, tăng tính an toàn của mã nguồn.

- **Performance improvements**: Java 17 mang lại các cải tiến về hiệu suất so với các phiên bản trước đó.

#### Data Access

**Spring Data JPA** cung cấp một abstraction layer trên Hibernate để đơn giản hóa việc truy cập cơ sở dữ liệu:

- **Repository pattern**: Cho phép định nghĩa các interface repository mà không cần implement, Spring Data JPA tự động tạo implementation dựa trên tên method.

- **Query methods**: Hỗ trợ viết các method query bằng cách đặt tên method theo quy ước, ví dụ `findByEmail(String email)` sẽ tự động tạo query tìm user theo email.

- **Pagination và sorting**: Cung cấp sẵn hỗ trợ cho phân trang và sắp xếp dữ liệu thông qua `Pageable` và `Sort`.

**Hibernate** là ORM (Object-Relational Mapping) framework được sử dụng để ánh xạ các Java object vào các bảng trong database:

- **Entity mapping**: Cho phép ánh xạ các Java class thành các bảng database thông qua các annotation như `@Entity`, `@Table`, `@Column`.

- **Lazy loading**: Hỗ trợ lazy loading để tối ưu hiệu suất, chỉ load dữ liệu liên quan khi cần thiết.

- **Transaction management**: Quản lý transaction tự động, đảm bảo tính toàn vẹn dữ liệu khi thực hiện các thao tác phức tạp.

**MySQL** là hệ quản trị cơ sở dữ liệu quan hệ được sử dụng:

- **ACID compliance**: Đảm bảo các giao dịch tuân thủ các tính chất ACID (Atomicity, Consistency, Isolation, Durability).

- **Foreign key constraints**: Hỗ trợ ràng buộc khóa ngoại để đảm bảo tính toàn vẹn dữ liệu.

- **Indexes**: Hỗ trợ tạo indexes để cải thiện hiệu suất truy vấn.

#### Security

**Spring Security** là framework bảo mật được tích hợp vào Spring Boot:

- **JWT (JSON Web Token) authentication**: Triển khai xác thực dựa trên JWT, cho phép xác thực stateless, không cần lưu trữ session trên server.

- **Role-based access control (RBAC)**: Hệ thống phân quyền dựa trên vai trò với ba cấp độ: ADMIN (quản trị viên), MANAGER (quản lý rạp), và USER (người dùng thường).

- **Password encoding**: Sử dụng BCrypt để mã hóa mật khẩu, đảm bảo mật khẩu không được lưu trữ dưới dạng plain text.

- **CORS configuration**: Cấu hình CORS để cho phép frontend gọi API từ domain khác.

**JWT** được sử dụng để xác thực người dùng:

- **Token-based authentication**: Mỗi người dùng sau khi đăng nhập sẽ nhận được một JWT token, token này được gửi kèm trong header của mỗi request tiếp theo.

- **Expiration handling**: Token có thời gian hết hạn, sau khi hết hạn người dùng cần đăng nhập lại hoặc sử dụng refresh token.

- **Refresh token mechanism**: Hỗ trợ cơ chế refresh token để gia hạn token mà không cần người dùng đăng nhập lại.

#### API Design

**RESTful API** được thiết kế theo các nguyên tắc REST (Representational State Transfer):

- **Resource-based URLs**: Mỗi tài nguyên được đại diện bởi một URL duy nhất, ví dụ `/api/movies`, `/api/orders`.

- **HTTP methods**: Sử dụng các HTTP method phù hợp: GET để lấy dữ liệu, POST để tạo mới, PUT để cập nhật, DELETE để xóa.

- **Status codes**: Sử dụng các HTTP status code chuẩn để biểu thị kết quả của request, ví dụ 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error).

- **JSON request/response**: Dữ liệu được truyền tải dưới định dạng JSON, dễ dàng parse và xử lý.

#### Real-time Features

**WebSocket (STOMP)** được sử dụng để cung cấp giao tiếp hai chiều giữa client và server:

- **Bidirectional communication**: Cho phép server gửi dữ liệu đến client mà không cần client phải request, khác với mô hình request-response truyền thống.

- **Real-time seat availability**: Khi một ghế được đặt, server sẽ broadcast thông tin này đến tất cả các client đang subscribe topic của suất chiếu đó.

- **Notification broadcasting**: Hệ thống có thể gửi thông báo đến nhiều người dùng đồng thời thông qua topic-based messaging.

#### Business Logic

**Drools** là Business Rules Engine được sử dụng để quản lý các quy tắc nghiệp vụ động:

- **Dynamic pricing rules**: Các quy tắc định giá có thể được thay đổi mà không cần sửa mã nguồn, ví dụ như tăng giá vào cuối tuần, giảm giá cho học sinh/sinh viên.

- **Showtime validation rules**: Các quy tắc xác thực lịch chiếu, ví dụ như không cho phép tạo lịch chiếu trùng thời gian trong cùng một phòng, hoặc không cho phép tạo lịch chiếu trong quá khứ.

- **Rule-based decision making**: Cho phép thực hiện các quyết định phức tạp dựa trên nhiều điều kiện, giúp mã nguồn dễ đọc và bảo trì hơn.

#### Integrations

**Cloudinary** là dịch vụ cloud được sử dụng để lưu trữ và xử lý hình ảnh:

- **Image upload**: Cho phép upload hình ảnh từ server lên cloud, trả về URL để lưu vào database.

- **Image transformation**: Cung cấp API để resize, crop, và thực hiện các biến đổi khác trên hình ảnh mà không cần download về server.

- **CDN delivery**: Hình ảnh được phân phối qua CDN, giúp tải nhanh hơn cho người dùng ở các khu vực địa lý khác nhau.

**JavaMail (Spring Mail)** được sử dụng để gửi email:

- **SMTP configuration**: Cấu hình SMTP server (Gmail) để gửi email.

- **HTML email templates**: Sử dụng template HTML để tạo email có định dạng đẹp, bao gồm email xác nhận đơn hàng với QR code.

- **OTP sending**: Gửi mã OTP qua email để xác thực tài khoản hoặc đặt lại mật khẩu.

- **Booking confirmation emails**: Gửi email xác nhận đơn hàng tự động sau khi thanh toán thành công.

**Google OAuth** được tích hợp để cho phép người dùng đăng nhập bằng tài khoản Google:

- **Google Sign-In integration**: Người dùng có thể chọn đăng nhập bằng Google thay vì tạo tài khoản mới.

- **User profile retrieval**: Lấy thông tin profile từ Google (tên, email, ảnh đại diện) để tạo tài khoản trong hệ thống.

**ZXing** là thư viện Java được sử dụng để tạo QR code:

- **QR code cho vé điện tử**: Mỗi vé được gán một QR code duy nhất, được in trong email xác nhận và hiển thị trong ứng dụng.

- **Booking verification**: QR code được sử dụng để xác minh vé tại rạp, đảm bảo tính xác thực của vé.

#### Payment Integration

**ZaloPay API** được tích hợp để xử lý thanh toán qua ZaloPay:

- **Payment processing**: Tạo yêu cầu thanh toán và chuyển hướng người dùng đến trang thanh toán ZaloPay.

- **Callback handling**: Xử lý callback từ ZaloPay sau khi thanh toán hoàn tất để cập nhật trạng thái đơn hàng.

- **Transaction verification**: Xác minh giao dịch với ZaloPay để đảm bảo tính xác thực của thanh toán.

**MoMo API** được tích hợp để xử lý thanh toán qua MoMo:

- **IPN (Instant Payment Notification)**: Nhận thông báo tức thời từ MoMo về trạng thái thanh toán.

- **Payment status updates**: Cập nhật trạng thái đơn hàng dựa trên kết quả thanh toán từ MoMo.

#### Cấu trúc thư mục Backend

Cấu trúc thư mục của backend được tổ chức theo mô hình MVC (Model-View-Controller) và các best practices của Spring Boot:

```
backend/
├── src/main/java/com/example/backend/
│   ├── config/              # Các class cấu hình (Security, WebSocket, CORS)
│   ├── controllers/         # REST controllers (xử lý HTTP requests)
│   ├── services/            # Business logic layer
│   ├── repositories/        # Data access layer (JPA repositories)
│   ├── entities/            # JPA entities (ánh xạ với database tables)
│   ├── dtos/                # Data Transfer Objects (đối tượng truyền dữ liệu)
│   ├── security/            # Security configuration (JWT, authentication)
│   ├── exceptions/          # Exception handling (custom exceptions, global handler)
│   └── utils/               # Utility classes (helper functions)
├── src/main/resources/
│   ├── application.properties # File cấu hình (database, mail, cloudinary, etc.)
│   └── drools/              # Drools rule files (.drl)
└── pom.xml                  # Maven dependencies và cấu hình project
```

### 1.2.3. Database

#### Database Management System

**MySQL 8.0+** là hệ quản trị cơ sở dữ liệu quan hệ được lựa chọn để lưu trữ dữ liệu của hệ thống. MySQL được chọn nhờ các đặc điểm sau:

- **ACID transactions**: Đảm bảo các giao dịch tuân thủ các tính chất ACID, đảm bảo tính nhất quán và toàn vẹn dữ liệu ngay cả khi có lỗi xảy ra.

- **Foreign key constraints**: Hỗ trợ ràng buộc khóa ngoại để duy trì tính toàn vẹn tham chiếu giữa các bảng, đảm bảo không có dữ liệu "mồ côi" (orphan records).

- **Indexes và query optimization**: Hỗ trợ tạo indexes trên các cột thường được sử dụng trong WHERE clause và JOIN, giúp cải thiện đáng kể hiệu suất truy vấn.

- **Stored procedures**: Hỗ trợ stored procedures và functions để thực hiện các thao tác phức tạp trực tiếp trên database, giảm tải cho application server.

#### Database Schema Design

Cơ sở dữ liệu của hệ thống bao gồm 15 bảng chính, được thiết kế để đảm bảo tính chuẩn hóa (normalization) và loại bỏ dữ liệu dư thừa:

1. **User**: Lưu trữ thông tin người dùng của hệ thống
   - Các trường chính: `id`, `email`, `password` (đã mã hóa), `name`, `phone`, `role` (ADMIN, MANAGER, USER)
   - Chức năng: Xác thực và phân quyền người dùng

2. **Movie**: Lưu trữ thông tin về các bộ phim
   - Các trường chính: `id`, `title`, `description`, `poster` (URL), `duration`, `rating` (độ tuổi), `releaseDate`, `status` (đang chiếu, sắp chiếu, đã ngừng chiếu)
   - Chức năng: Quản lý danh mục phim

3. **CinemaComplex**: Lưu trữ thông tin về các cụm rạp chiếu phim
   - Các trường chính: `id`, `name`, `address`, `phone`
   - Chức năng: Quản lý thông tin các cụm rạp

4. **Cinema**: Lưu trữ thông tin về các rạp trong một cụm rạp
   - Các trường chính: `id`, `name`, `cinemaComplexId` (khóa ngoại)
   - Chức năng: Quản lý các rạp thuộc một cụm rạp

5. **Room**: Lưu trữ thông tin về các phòng chiếu trong một rạp
   - Các trường chính: `id`, `name`, `capacity` (sức chứa), `roomType` (STANDARD, VIP, IMAX), `cinemaId` (khóa ngoại)
   - Chức năng: Quản lý các phòng chiếu và sơ đồ ghế ngồi

6. **Showtime**: Lưu trữ thông tin về các suất chiếu
   - Các trường chính: `id`, `movieId` (khóa ngoại), `roomId` (khóa ngoại), `startTime`, `endTime`, `price`, `availableSeats`
   - Chức năng: Quản lý lịch chiếu phim

7. **Seat**: Lưu trữ thông tin về các ghế ngồi trong phòng chiếu
   - Các trường chính: `id`, `roomId` (khóa ngoại), `seatNumber`, `seatType` (NORMAL, VIP), `status` (available, booked, reserved)
   - Chức năng: Quản lý trạng thái ghế ngồi

8. **Order**: Lưu trữ thông tin về các đơn hàng
   - Các trường chính: `id`, `userId` (khóa ngoại), `orderDate`, `totalAmount`, `paymentMethod` (ZaloPay, MoMo, Cash), `status`, `voucherCode`, `cinemaComplexId` (cho đơn đồ ăn)
   - Chức năng: Quản lý đơn hàng và giao dịch

9. **Ticket**: Lưu trữ thông tin về các vé xem phim
   - Các trường chính: `id`, `orderId` (khóa ngoại), `showtimeId` (khóa ngoại), `seatId` (khóa ngoại), `price`, `qrCode`
   - Chức năng: Quản lý vé và QR code

10. **Combo**: Lưu trữ thông tin về các combo đồ ăn
    - Các trường chính: `id`, `name`, `description`, `price`, `image` (URL), `isAvailable`
    - Chức năng: Quản lý menu đồ ăn

11. **OrderCombo**: Bảng trung gian lưu trữ chi tiết combo trong đơn hàng
    - Các trường chính: `orderId` (khóa ngoại), `comboId` (khóa ngoại), `quantity`, `price`
    - Chức năng: Quan hệ many-to-many giữa Order và Combo

12. **Voucher**: Lưu trữ thông tin về các mã giảm giá
    - Các trường chính: `id`, `code`, `discountType` (PERCENTAGE, FIXED), `discountValue`, `startDate`, `endDate`, `usageLimit`
    - Chức năng: Quản lý voucher và áp dụng giảm giá

13. **Review**: Lưu trữ các đánh giá của người dùng về phim
    - Các trường chính: `id`, `userId` (khóa ngoại), `movieId` (khóa ngoại), `rating` (1-5 sao), `comment`, `createdDate`
    - Chức năng: Quản lý đánh giá và bình luận

14. **Banner**: Lưu trữ thông tin về các banner quảng cáo
    - Các trường chính: `id`, `name`, `image` (URL), `isActive`, `displayOrder`
    - Chức năng: Quản lý banner hiển thị trên trang chủ

15. **ActivityLog**: Lưu trữ nhật ký hoạt động của người dùng và hệ thống
    - Các trường chính: `id`, `userId` (khóa ngoại), `action` (CREATE, UPDATE, DELETE), `objectType` (MOVIE, ORDER, USER, etc.), `objectId`, `timestamp`, `details`
    - Chức năng: Audit trail và theo dõi hoạt động

#### Relationships

Các mối quan hệ giữa các bảng được thiết kế như sau:

- **Quan hệ One-to-Many**:
  - Một User có nhiều Orders
  - Một CinemaComplex có nhiều Cinemas
  - Một Cinema có nhiều Rooms
  - Một Room có nhiều Seats
  - Một Movie có nhiều Showtimes
  - Một Showtime có nhiều Tickets
  - Một Order có nhiều Tickets và OrderCombos

- **Quan hệ Many-to-Many**:
  - Order và Combo có quan hệ many-to-many thông qua bảng trung gian OrderCombo, cho phép một đơn hàng chứa nhiều combo và một combo có thể xuất hiện trong nhiều đơn hàng.

#### Indexes và Performance

Để tối ưu hiệu suất truy vấn, các indexes được tạo trên các cột sau:

- **Primary keys**: Tất cả các bảng đều có primary key, tự động tạo clustered index.

- **Foreign key indexes**: Các cột foreign key được đánh index để tăng tốc độ JOIN và kiểm tra ràng buộc.

- **Composite indexes**: Các index kết hợp được tạo trên các cặp cột thường được sử dụng cùng nhau trong WHERE clause, ví dụ `(movieId, startTime)` trong bảng Showtime.

- **Search indexes**: Các index được tạo trên các cột thường được sử dụng để tìm kiếm, ví dụ `title` trong bảng Movie, `email` và `phone` trong bảng User.

#### Data Integrity

Tính toàn vẹn dữ liệu được đảm bảo thông qua các ràng buộc sau:

- **Foreign key constraints**: Đảm bảo không có dữ liệu "mồ côi", ví dụ không thể tạo Ticket mà không có Order, Showtime, và Seat tương ứng.

- **Check constraints**: Đảm bảo dữ liệu tuân thủ các quy tắc nghiệp vụ, ví dụ `rating` trong bảng Review phải nằm trong khoảng 1-5, `discountValue` phải lớn hơn 0.

- **Unique constraints**: Đảm bảo tính duy nhất của dữ liệu, ví dụ `email` trong bảng User phải duy nhất, `code` trong bảng Voucher phải duy nhất.

- **NOT NULL constraints**: Đảm bảo các trường bắt buộc không được để trống, ví dụ `title` trong bảng Movie, `email` và `password` trong bảng User.

#### Backup và Recovery

Để đảm bảo an toàn dữ liệu, hệ thống cần được cấu hình với các cơ chế backup và recovery:

- **Regular database backups**: Thực hiện backup định kỳ (hàng ngày hoặc hàng tuần) để có thể khôi phục dữ liệu trong trường hợp mất mát.

- **Transaction logs**: MySQL lưu trữ transaction logs, cho phép khôi phục đến một thời điểm cụ thể (point-in-time recovery).

- **Point-in-time recovery capability**: Có thể khôi phục database đến bất kỳ thời điểm nào trong quá khứ dựa trên backup và transaction logs.
