# CHƯƠNG 1: KIẾN TRÚC VÀ CÔNG NGHỆ

## 1.1. Kiến trúc hệ thống

Hệ thống đặt vé xem phim được thiết kế và xây dựng dựa trên mô hình kiến trúc **Client-Server** hiện đại, áp dụng nguyên tắc phân tầng rõ ràng với kiến trúc **ba tầng** (3-tier architecture) bao gồm: tầng trình bày (Presentation Layer), tầng nghiệp vụ (Business Logic Layer) và tầng truy cập dữ liệu (Data Access Layer). Việc giao tiếp giữa các thành phần được thực hiện thông qua mô hình **RESTful API**, đảm bảo tính linh hoạt, dễ mở rộng và bảo trì của hệ thống.

Kiến trúc này cho phép hệ thống tách biệt rõ ràng giữa giao diện người dùng, logic nghiệp vụ và dữ liệu, tạo điều kiện thuận lợi cho việc phát triển, bảo trì và nâng cấp từng phần độc lập mà không ảnh hưởng đến các thành phần khác. Đồng thời, việc sử dụng giao thức WebSocket cho phép hệ thống cung cấp các tính năng real-time, mang lại trải nghiệm người dùng tốt hơn.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Frontend (Port 5173)                          │   │
│  │  - User Interface                                    │   │
│  │  - State Management                                  │   │
│  │  - WebSocket Client                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
                            ↕ WebSocket (STOMP)
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Spring Boot Backend (Port 8080)                     │   │
│  │  - Controllers (REST API)                            │   │
│  │  - Services (Business Logic)                          │   │
│  │  - Security (JWT, Spring Security)                   │   │
│  │  - WebSocket Server                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ JPA/Hibernate
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MySQL Database                                       │   │
│  │  - Entity Tables                                      │   │
│  │  - Relationships                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.1.1. Kiến trúc Backend (Spring Boot)

Phần backend của hệ thống được tổ chức theo mô hình **Layered Architecture** (Kiến trúc phân tầng), một mô hình thiết kế phổ biến trong phát triển phần mềm doanh nghiệp. Mô hình này giúp tách biệt các trách nhiệm, tạo ra cấu trúc code rõ ràng, dễ đọc và dễ bảo trì. Mỗi tầng có một vai trò và trách nhiệm cụ thể, tạo nên một hệ thống có tính module cao và dễ dàng mở rộng.

**Tầng Controller (Controller Layer)** đóng vai trò là điểm tiếp nhận và xử lý các yêu cầu HTTP từ phía client. Đây là lớp đầu tiên tiếp xúc với các request từ người dùng, có nhiệm vụ kiểm tra tính hợp lệ của dữ liệu đầu vào, điều phối các yêu cầu đến các service tương ứng, và trả về kết quả phù hợp cho client. Các controller trong hệ thống được thiết kế theo nguyên tắc RESTful, sử dụng các phương thức HTTP chuẩn như GET, POST, PUT, DELETE để thực hiện các thao tác CRUD (Create, Read, Update, Delete). Hệ thống bao gồm các controller chính như: `AuthController` xử lý các chức năng xác thực người dùng bao gồm đăng nhập, đăng ký và xác thực qua OAuth; `MovieController` quản lý các thao tác liên quan đến phim; `ShowtimeController` xử lý việc quản lý suất chiếu; `PaymentController` tích hợp với các cổng thanh toán như ZaloPay và MoMo để xử lý các giao dịch thanh toán; `OrderController` quản lý đơn hàng của khách hàng; `SeatWebSocketController` xử lý các kết nối WebSocket để quản lý việc chọn ghế theo thời gian thực; cùng với các controller dành riêng cho quản trị viên và quản lý rạp phim.

**Tầng Service (Service Layer)** là nơi chứa đựng toàn bộ logic nghiệp vụ của hệ thống. Đây là lớp quan trọng nhất trong kiến trúc, nơi các quy tắc kinh doanh được triển khai và xử lý. Các service nhận dữ liệu từ controller, thực hiện các xử lý phức tạp, tương tác với repository để truy xuất hoặc lưu trữ dữ liệu, và trả về kết quả cho controller. Trong hệ thống, các service chính bao gồm: `OrderCreationService` chịu trách nhiệm tạo và quản lý đơn hàng với các logic phức tạp như tính toán giá, áp dụng voucher, và xác thực tính khả dụng của ghế; các service thanh toán như `PaymentService`, `ZaloPayService`, và `MomoService` xử lý việc tích hợp với các cổng thanh toán, tạo yêu cầu thanh toán, xác thực callback và cập nhật trạng thái đơn hàng; `ShowtimeService` chứa các logic nghiệp vụ liên quan đến suất chiếu như kiểm tra xung đột thời gian, xác thực tính hợp lệ của suất chiếu; `NotificationService` và `EmailService` xử lý việc gửi thông báo và email cho người dùng, bao gồm cả việc gửi mã OTP và các thông báo về đơn hàng.

**Tầng Repository (Repository Layer)** đóng vai trò là lớp trừu tượng hóa việc truy cập dữ liệu, cung cấp một giao diện đơn giản và nhất quán để tương tác với cơ sở dữ liệu. Sử dụng công nghệ **Spring Data JPA** kết hợp với **Hibernate**, tầng này cho phép các service truy cập dữ liệu mà không cần phải viết các câu lệnh SQL phức tạp. Hibernate tự động chuyển đổi các thao tác trên đối tượng Java thành các câu lệnh SQL tương ứng, giúp giảm thiểu công sức phát triển và tăng tính nhất quán của code. Mỗi entity trong hệ thống đều có một repository tương ứng, ví dụ như `UserRepository`, `MovieRepository`, `OrderRepository`, v.v. Các repository này kế thừa từ `JpaRepository`, cung cấp sẵn các phương thức cơ bản như `save()`, `findById()`, `findAll()`, `delete()`, và cho phép định nghĩa các phương thức truy vấn tùy chỉnh thông qua cú pháp đặc biệt của Spring Data JPA.

**Tầng Entity (Entity Layer)** định nghĩa cấu trúc dữ liệu của hệ thống, mô tả các bảng trong cơ sở dữ liệu và mối quan hệ giữa chúng. Mỗi entity đại diện cho một bảng trong database, với các trường (fields) tương ứng với các cột trong bảng. Các entity được đánh dấu bằng các annotation của JPA như `@Entity`, `@Table`, `@Id`, `@Column`, và các annotation mô tả mối quan hệ như `@OneToMany`, `@ManyToOne`, `@ManyToMany`. Hệ thống bao gồm các nhóm entity chính: nhóm quản lý người dùng gồm `User`, `Customer`, `Admin`, `Manager` để phân biệt các vai trò khác nhau trong hệ thống; nhóm quản lý phim và rạp chiếu gồm `Movie`, `Showtime`, `CinemaComplex`, `CinemaRoom`, `Seat` để mô tả cấu trúc của hệ thống rạp phim; nhóm quản lý đơn hàng gồm `Order`, `Ticket`, `OrderCombo` để lưu trữ thông tin về các giao dịch; nhóm quản lý kinh doanh gồm `Voucher`, `FoodCombo`, `Price`, `Review` để hỗ trợ các chức năng marketing và dịch vụ khách hàng; và nhóm hệ thống gồm `Notification`, `ActivityLog`, `Banner` để quản lý các tính năng phụ trợ.

### 1.1.2. Kiến trúc Frontend (React)

Phần frontend của hệ thống được xây dựng dựa trên mô hình **Component-Based Architecture** (Kiến trúc dựa trên component), một phương pháp thiết kế hiện đại cho phép xây dựng giao diện người dùng từ các thành phần nhỏ, có thể tái sử dụng. Mỗi component là một đơn vị độc lập, có thể tự quản lý trạng thái và giao diện của mình, giúp code trở nên dễ đọc, dễ bảo trì và dễ kiểm thử.

Cấu trúc thư mục của frontend được tổ chức một cách logic và có hệ thống, tạo điều kiện thuận lợi cho việc tìm kiếm và quản lý code. Thư mục `components` chứa các component có thể tái sử dụng, được chia thành các thư mục con như `AdminDashboard` và `ManagerDashboard` để tổ chức các component dành riêng cho từng vai trò. Các component chung như `Header` và `Footer` được đặt ở cấp cao nhất để dễ dàng truy cập. Thư mục `pages` chứa các component đại diện cho các trang chính của ứng dụng như trang chủ, trang chi tiết phim, trang đặt vé. Thư mục `services` chứa các module xử lý việc giao tiếp với backend thông qua API, mỗi service tương ứng với một domain cụ thể như authentication, movie, payment. Cuối cùng, thư mục `styles` chứa các file CSS được tổ chức theo module, giúp quản lý styling một cách có hệ thống.

Hệ thống sử dụng nhiều phương pháp quản lý trạng thái khác nhau tùy theo nhu cầu và phạm vi sử dụng. Đối với trạng thái cục bộ của từng component, hệ thống sử dụng các React Hooks như `useState` để quản lý trạng thái đơn giản, `useEffect` để xử lý các side effects như gọi API hoặc đăng ký event listeners, và `useMemo` để tối ưu hóa hiệu suất bằng cách memoize các giá trị tính toán phức tạp. Đối với trạng thái toàn cục cần được chia sẻ giữa nhiều component, hệ thống sử dụng Context API của React để quản lý các trạng thái như thông tin xác thực người dùng và hệ thống thông báo. Trạng thái từ server được quản lý thông qua các service sử dụng Axios, với mỗi component tự quản lý việc fetch và cập nhật dữ liệu từ API.

Hệ thống sử dụng **React Router DOM** phiên bản 7 để thực hiện định tuyến phía client, cho phép điều hướng giữa các trang mà không cần tải lại toàn bộ trang web. Điều này tạo ra trải nghiệm người dùng mượt mà và nhanh chóng. Hệ thống định tuyến được bảo vệ bằng các Protected Routes, đảm bảo rằng chỉ những người dùng đã xác thực và có quyền phù hợp mới có thể truy cập vào các trang nhạy cảm như trang quản trị hoặc trang đặt vé. Ngoài ra, hệ thống hỗ trợ dynamic routing, cho phép tạo các route động dựa trên các tham số như ID phim hoặc ID đơn hàng, tạo điều kiện cho việc xây dựng các trang chi tiết linh hoạt.

### 1.1.3. Kiến trúc Giao tiếp Real-time

Để cung cấp các tính năng real-time như cập nhật trạng thái ghế ngồi theo thời gian thực, hệ thống sử dụng công nghệ **WebSocket**, một giao thức truyền thông hai chiều cho phép server và client trao đổi dữ liệu mà không cần client phải liên tục gửi request. Trên nền tảng WebSocket, hệ thống sử dụng giao thức **STOMP** (Simple Text Oriented Messaging Protocol), một giao thức messaging cung cấp mô hình publish/subscribe, cho phép client đăng ký nhận thông báo từ các topic cụ thể.

Phía backend, **Spring WebSocket** với hỗ trợ STOMP được sử dụng để xử lý các kết nối WebSocket và quản lý các message. Phía frontend, **SockJS** được sử dụng như một wrapper cho WebSocket, cung cấp các cơ chế fallback để đảm bảo tương thích với các trình duyệt khác nhau, trong khi **STOMP.js** được sử dụng để xử lý giao thức STOMP ở phía client.

Các trường hợp sử dụng chính của WebSocket trong hệ thống bao gồm: quản lý việc chọn ghế theo thời gian thực, đảm bảo rằng khi một người dùng chọn ghế, tất cả người dùng khác đều thấy ghế đó đã được chọn ngay lập tức; quản lý timeout cho ghế, tự động giải phóng ghế sau một khoảng thời gian nhất định (2 phút) nếu người dùng không hoàn tất việc đặt vé; và gửi thông báo real-time cho người dùng về các sự kiện quan trọng như xác nhận thanh toán hoặc cập nhật đơn hàng.

```
Client (React)                    Server (Spring Boot)
     │                                  │
     │  ──── WebSocket Connect ──────> │
     │                                  │
     │  ──── SUBSCRIBE /topic/seats ──> │
     │                                  │
     │  ──── SELECT Seat ─────────────> │
     │                                  │
     │ <──── Seat Status Update ──────── │
     │                                  │
     │ <──── BATCH_DESELECTED ───────── │ (Timeout)
```

## 1.2. Khái quát về công nghệ sử dụng

### 1.2.1. Front End

#### Framework cốt lõi

**React 19.1.1** được sử dụng như thư viện UI chính cho phần frontend. React là một thư viện JavaScript phổ biến và mạnh mẽ, được phát triển bởi Facebook, cho phép xây dựng giao diện người dùng phức tạp từ các component có thể tái sử dụng. React sử dụng Virtual DOM để tối ưu hóa việc cập nhật giao diện, chỉ render lại những phần thay đổi, giúp ứng dụng chạy nhanh và mượt mà. React Hooks API cung cấp các hook như `useState` để quản lý trạng thái, `useEffect` để xử lý side effects, `useMemo` và `useCallback` để tối ưu hóa hiệu suất. Context API cho phép chia sẻ trạng thái giữa các component mà không cần prop drilling. **React DOM 19.1.1** là renderer của React cho web, chịu trách nhiệm render các React component thành các phần tử DOM trong trình duyệt.

#### Công cụ Build và Phát triển

**Vite 7.1.7** được sử dụng như công cụ build và dev server cho phần frontend. Vite là một build tool hiện đại và nhanh chóng, sử dụng ES modules để cung cấp Hot Module Replacement (HMR) cực kỳ nhanh, cho phép thấy thay đổi ngay lập tức khi chỉnh sửa code mà không cần reload toàn bộ trang. Vite cũng tối ưu hóa các production builds, tạo ra các bundle nhỏ gọn và tối ưu để triển khai. **ESLint** được sử dụng để kiểm tra chất lượng code, phát hiện các lỗi tiềm ẩn và đảm bảo code tuân thủ các best practices. ESLint được cấu hình với các rules dành riêng cho React hooks để đảm bảo các hook được sử dụng đúng cách.

#### Định tuyến

**React Router DOM 7.9.6** được sử dụng để thực hiện client-side routing, cho phép điều hướng giữa các trang mà không cần tải lại toàn bộ trang web. React Router cung cấp định tuyến khai báo, cho phép định nghĩa các route một cách rõ ràng và dễ hiểu. Hệ thống cũng sử dụng protected routes để bảo vệ các route nhạy cảm, đảm bảo chỉ những người dùng đã xác thực mới có thể truy cập. Dynamic routes cho phép tạo các route linh hoạt dựa trên các tham số, và navigation guards đảm bảo người dùng được điều hướng đúng cách.

#### Styling

**Tailwind CSS 3.4.18** được sử dụng như một utility-first CSS framework, cho phép xây dựng giao diện nhanh chóng bằng cách sử dụng các class tiện ích thay vì viết CSS tùy chỉnh. Tailwind cung cấp responsive design out-of-the-box, cho phép tạo giao diện thân thiện với mobile một cách dễ dàng. Framework này có thể được cấu hình tùy chỉnh thông qua file `tailwind.config.js` và tích hợp với PostCSS để xử lý CSS. Ngoài ra, hệ thống cũng sử dụng custom CSS cho các component cụ thể, được tổ chức theo module để dễ quản lý. CSS variables được sử dụng để quản lý theme, cho phép dễ dàng thay đổi màu sắc và styling của toàn bộ ứng dụng. Hệ thống hỗ trợ dark theme để cung cấp trải nghiệm người dùng tốt hơn.

#### HTTP Client

**Axios 1.13.2** được sử dụng như HTTP client library để giao tiếp với backend API. Axios cung cấp Promise-based API, cho phép xử lý các request bất đồng bộ một cách dễ dàng. Thư viện này cung cấp request và response interceptors, cho phép thêm token xác thực vào mọi request hoặc xử lý lỗi một cách tập trung. Axios tự động parse JSON responses và cung cấp error handling tốt.

#### Giao tiếp Real-time

**SockJS 1.6.1** được sử dụng như WebSocket client library, cung cấp các cơ chế fallback để đảm bảo tương thích với các trình duyệt khác nhau. Nếu WebSocket không được hỗ trợ, SockJS sẽ tự động fallback sang các phương thức khác như long polling. **@stomp/stompjs 7.2.1** được sử dụng để xử lý giao thức STOMP ở phía client, cung cấp khả năng subscribe vào các topic để nhận message và publish message lên server. Thư viện này xử lý việc kết nối, đăng ký, và quản lý các subscription một cách tự động.

#### Component UI và Trực quan hóa

**Recharts 3.4.1** được sử dụng để tạo các biểu đồ và đồ thị cho phần dashboard của admin và manager. Thư viện này cung cấp các loại biểu đồ như line chart, bar chart, và pie chart, tất cả đều responsive và có thể tùy chỉnh styling. Recharts được xây dựng dựa trên D3.js và React, cung cấp API đơn giản và dễ sử dụng. **QRCode.react 4.2.0** được sử dụng để tạo component hiển thị mã QR code trong React. Component này cho phép tùy chỉnh kích thước và styling của mã QR code, được sử dụng để hiển thị mã QR code cho vé xem phim và đơn hàng đồ ăn.

#### Xuất dữ liệu

**ExcelJS 4.4.0** được sử dụng để tạo các file Excel, cho phép admin và manager xuất các báo cáo ra file Excel. Thư viện này cung cấp khả năng tạo file Excel với format phức tạp, bao gồm định dạng cells, merge cells, và các tính năng khác. **XLSX 0.18.5** được sử dụng để đọc và parse các file Excel, cho phép import dữ liệu từ file Excel vào hệ thống nếu cần.

#### Xác thực

**@react-oauth/google 0.12.2** được sử dụng để tích hợp Google OAuth vào frontend, cung cấp Google Sign-In button và xử lý luồng OAuth. Thư viện này quản lý việc lấy token từ Google và gửi token lên backend để xác thực.

### 1.2.2. Back End

#### Framework cốt lõi

Hệ thống sử dụng **Spring Boot 3.5.7** làm framework chính cho phần backend. Spring Boot là một framework mạnh mẽ được xây dựng trên nền tảng Spring Framework, cung cấp một cách tiếp cận đơn giản và nhanh chóng để phát triển các ứng dụng Java doanh nghiệp. Framework này cung cấp tính năng Dependency Injection, cho phép quản lý các phụ thuộc một cách tự động và linh hoạt, giúp code trở nên dễ test và dễ bảo trì. Tính năng Auto-configuration tự động cấu hình các thành phần dựa trên các dependency có sẵn, giảm thiểu đáng kể công sức cấu hình. Spring Boot cũng đi kèm với một embedded server (Tomcat), cho phép chạy ứng dụng như một standalone application mà không cần cài đặt server riêng biệt. Ngoài ra, framework này cung cấp nhiều tính năng production-ready như health checks, metrics, và externalized configuration.

Ngôn ngữ lập trình được sử dụng là **Java 17**, một phiên bản LTS (Long Term Support) của Java, đảm bảo hỗ trợ lâu dài và ổn định. Java 17 mang đến nhiều tính năng hiện đại như records để định nghĩa các lớp dữ liệu đơn giản, pattern matching để viết code ngắn gọn và dễ đọc hơn, và nhiều cải tiến khác giúp tăng năng suất phát triển.

#### Truy cập dữ liệu

Để tương tác với cơ sở dữ liệu, hệ thống sử dụng **Spring Data JPA** như một lớp trừu tượng hóa các thao tác database, giúp giảm thiểu code boilerplate và tăng năng suất phát triển. **Hibernate** được sử dụng như ORM framework, chịu trách nhiệm ánh xạ các đối tượng Java thành các bảng trong database, quản lý các mối quan hệ giữa các entity (One-to-Many, Many-to-One, Many-to-Many), và tối ưu hóa các truy vấn để đảm bảo hiệu suất tốt.

#### Bảo mật

Bảo mật là một khía cạnh quan trọng của hệ thống, được xử lý thông qua **Spring Security**, một framework bảo mật mạnh mẽ và toàn diện. Framework này cung cấp các tính năng xác thực (authentication) thông qua JWT và OAuth2, cho phép người dùng đăng nhập bằng tài khoản hệ thống hoặc tài khoản Google. Tính năng phân quyền (authorization) được thực hiện thông qua Role-based Access Control, đảm bảo rằng mỗi người dùng chỉ có thể truy cập vào các tài nguyên phù hợp với vai trò của họ. Mật khẩu được mã hóa bằng thuật toán BCrypt, một thuật toán hashing mạnh mẽ và an toàn. Ngoài ra, Spring Security cũng cung cấp cấu hình CORS để kiểm soát việc truy cập từ các domain khác.

**JWT (JSON Web Token)** được sử dụng để thực hiện xác thực dựa trên token, một phương pháp stateless cho phép server xác thực người dùng mà không cần lưu trữ session. Thư viện `jjwt` (io.jsonwebtoken) được sử dụng để tạo và xác thực JWT tokens, với khả năng quản lý thời gian hết hạn của token để đảm bảo bảo mật.

**Google OAuth 2.0** được tích hợp để cho phép người dùng đăng nhập bằng tài khoản Google của họ, cung cấp trải nghiệm đăng nhập thuận tiện và nhanh chóng. Google API Client Library được sử dụng để xử lý luồng OAuth và lấy thông tin người dùng từ Google.

#### Giao tiếp Real-time

Để cung cấp các tính năng real-time, hệ thống sử dụng **Spring WebSocket** để hỗ trợ các kết nối WebSocket, cho phép giao tiếp hai chiều giữa client và server. **Giao thức STOMP** được sử dụng như một messaging protocol trên nền tảng WebSocket, cung cấp mô hình publish/subscribe, cho phép client đăng ký nhận thông báo từ các topic cụ thể và server có thể gửi message đến nhiều client cùng lúc. Giao thức này cũng cung cấp quản lý session, cho phép server theo dõi và quản lý các kết nối WebSocket.

#### Business Rules Engine

Hệ thống sử dụng **Drools 8.40.0**, một Business Rules Management System mạnh mẽ, để thực hiện các validation và business rules phức tạp. Drools cho phép định nghĩa các quy tắc nghiệp vụ trong các file `.drl` (Drools Rule Language), tách biệt logic nghiệp vụ khỏi code, giúp dễ dàng thay đổi và bảo trì các quy tắc mà không cần sửa đổi code. Trong hệ thống, Drools được sử dụng để validate các suất chiếu, đảm bảo rằng các suất chiếu tuân thủ các quy tắc nghiệp vụ như không xung đột thời gian, không vượt quá khả năng của phòng chiếu, và các quy tắc khác.

#### Tích hợp Thanh toán

Hệ thống tích hợp với hai cổng thanh toán phổ biến tại Việt Nam là **ZaloPay** và **MoMo** để cung cấp các phương thức thanh toán đa dạng cho người dùng. **ZaloPay API** được tích hợp với môi trường sandbox để phát triển và kiểm thử, sử dụng HMAC signature để xác thực các request và response, đảm bảo tính bảo mật của các giao dịch. Hệ thống xử lý các callback từ ZaloPay để cập nhật trạng thái đơn hàng sau khi thanh toán thành công.

**MoMo Payment API** cũng được tích hợp với môi trường sandbox, sử dụng IPN (Instant Payment Notification) để nhận thông báo về trạng thái thanh toán, và xử lý redirect để đưa người dùng quay lại trang web sau khi thanh toán.

#### Dịch vụ Bên ngoài

Hệ thống sử dụng **Cloudinary** như một dịch vụ lưu trữ hình ảnh trên đám mây, cho phép upload, lưu trữ và phân phối hình ảnh một cách hiệu quả. Cloudinary cung cấp các tính năng biến đổi hình ảnh như resize, crop, và format conversion, cũng như CDN (Content Delivery Network) để phân phối hình ảnh nhanh chóng đến người dùng trên toàn thế giới.

**JavaMail** (thông qua Spring Mail) được sử dụng để gửi email, với cấu hình SMTP sử dụng Gmail. Dịch vụ này được sử dụng để gửi mã OTP cho việc xác thực người dùng, gửi thông báo về đơn hàng, và các email thông báo khác.

#### Tiện ích

**Lombok** được sử dụng như một thư viện code generation, giúp giảm thiểu code boilerplate bằng cách tự động sinh ra các phương thức getter, setter, constructor, và các phương thức khác thông qua các annotation như `@Data`, `@Getter`, `@Setter`, `@RequiredArgsConstructor`. Điều này giúp code trở nên ngắn gọn và dễ đọc hơn.

**ZXing** (Zebra Crossing) được sử dụng để tạo mã QR code cho vé xem phim và đơn hàng đồ ăn. Thư viện này cung cấp khả năng tạo và đọc mã QR code, cho phép hệ thống tạo mã QR code chứa thông tin về vé hoặc đơn hàng, giúp việc kiểm tra và xác thực trở nên thuận tiện.

**Jackson** được sử dụng để xử lý JSON, bao gồm serialization (chuyển đổi đối tượng Java thành JSON) và deserialization (chuyển đổi JSON thành đối tượng Java). Jackson cũng cung cấp các tính năng như định dạng ngày tháng và custom serializers để xử lý các trường hợp đặc biệt.

#### Công cụ Build

**Maven** được sử dụng như công cụ quản lý dependency và build tool cho phần backend. Maven sử dụng file `pom.xml` để định nghĩa các dependency, plugins, và cấu hình build. Nó tự động giải quyết các dependency và quản lý vòng đời build (compile, test, package, install, deploy), giúp quá trình phát triển trở nên dễ dàng và nhất quán.

### 1.2.3. Database

Hệ thống sử dụng **MySQL** làm hệ quản trị cơ sở dữ liệu quan hệ, một lựa chọn phổ biến và đáng tin cậy cho các ứng dụng web doanh nghiệp. MySQL là một hệ quản trị cơ sở dữ liệu mã nguồn mở, được sử dụng rộng rãi trong các ứng dụng web do tính ổn định, hiệu suất cao và dễ sử dụng. MySQL tuân thủ các nguyên tắc ACID (Atomicity, Consistency, Isolation, Durability), đảm bảo tính nhất quán và độ tin cậy của dữ liệu. Hệ thống hỗ trợ đầy đủ các giao dịch, cho phép thực hiện các thao tác phức tạp một cách an toàn và đáng tin cậy.

Việc quản lý schema và migration được thực hiện tự động thông qua Hibernate với cấu hình `spring.jpa.hibernate.ddl-auto=update`, cho phép hệ thống tự động cập nhật cấu trúc database khi có thay đổi trong các entity. Điều này giúp đơn giản hóa quá trình phát triển, mặc dù trong môi trường production, việc sử dụng các công cụ migration chuyên dụng như Flyway hoặc Liquibase được khuyến nghị để có kiểm soát tốt hơn.

Cơ sở dữ liệu được tổ chức thành các nhóm bảng chính phục vụ các mục đích khác nhau. **Nhóm quản lý người dùng** bao gồm các bảng `users`, `customers`, `admins`, `managers` để phân biệt và quản lý các vai trò khác nhau trong hệ thống. Mỗi vai trò có các quyền và chức năng riêng, được quản lý thông qua hệ thống phân quyền.

**Nhóm quản lý phim và rạp chiếu** gồm các bảng `movies`, `showtimes`, `cinema_complexes`, `cinema_rooms`, `seats` để mô tả đầy đủ cấu trúc của hệ thống rạp phim và lịch chiếu. Bảng `movies` lưu trữ thông tin về các bộ phim, bao gồm tiêu đề, mô tả, thời lượng, độ tuổi cho phép, và các thông tin khác. Bảng `showtimes` lưu trữ thông tin về các suất chiếu, liên kết phim với phòng chiếu và thời gian chiếu. Bảng `cinema_complexes` và `cinema_rooms` mô tả cấu trúc của các cụm rạp và phòng chiếu, trong khi bảng `seats` lưu trữ thông tin về các ghế ngồi trong từng phòng chiếu.

**Nhóm quản lý đơn hàng** gồm các bảng `orders`, `tickets`, `order_combos` để lưu trữ thông tin về các giao dịch và vé đã bán. Bảng `orders` là bảng trung tâm, lưu trữ thông tin tổng quan về mỗi đơn hàng, bao gồm người đặt, thời gian đặt, tổng tiền, và trạng thái thanh toán. Bảng `tickets` lưu trữ thông tin về các vé xem phim đã được bán, liên kết với đơn hàng và suất chiếu. Bảng `order_combos` lưu trữ thông tin về các combo đồ ăn được đặt kèm theo đơn hàng.

**Nhóm quản lý kinh doanh** gồm các bảng `vouchers`, `food_combos`, `prices`, `reviews` để hỗ trợ các chức năng marketing, bán hàng và dịch vụ khách hàng. Bảng `vouchers` lưu trữ thông tin về các mã giảm giá và khuyến mãi. Bảng `food_combos` lưu trữ thông tin về các combo đồ ăn có sẵn. Bảng `prices` lưu trữ thông tin về giá vé cho các loại ghế và định dạng khác nhau. Bảng `reviews` lưu trữ các đánh giá và nhận xét của khách hàng về phim.

Cuối cùng, **nhóm hệ thống** gồm các bảng `notifications`, `activity_logs`, `banners` để quản lý các tính năng phụ trợ như thông báo, ghi nhận hoạt động và quảng cáo. Bảng `notifications` lưu trữ các thông báo gửi đến người dùng. Bảng `activity_logs` ghi nhận các hoạt động quan trọng trong hệ thống để phục vụ cho việc audit và debugging. Bảng `banners` lưu trữ thông tin về các banner quảng cáo hiển thị trên trang web.

Các mối quan hệ giữa các bảng được thiết kế cẩn thận để đảm bảo tính nhất quán và toàn vẹn của dữ liệu. Hibernate tự động quản lý các mối quan hệ này thông qua các annotation như `@OneToMany`, `@ManyToOne`, và `@ManyToMany`, đảm bảo rằng các thao tác trên dữ liệu được thực hiện một cách an toàn và nhất quán.
