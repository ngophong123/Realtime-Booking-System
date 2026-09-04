# 🎬 CINEVERSE - Frontend Realtime Cinema Booking System

Hệ thống giao diện người dùng (Frontend) hiện đại, trực quan và tối ưu trải nghiệm cho nền tảng đặt vé xem phim trực tuyến thời gian thực **CINEVERSE Cinema**. Được xây dựng với **React 18**, **TypeScript**, **Vite** và kết nối **Socket.IO** đồng bộ ghế & thông báo Realtime.

---

## 📑 Mục Lục Điều Hướng

| STT | Phân Mục | Nội Dung Chi Tiết | Lối Tắt |
| :---: | :--- | :--- | :---: |
| **01** | 🚀 **Công Nghệ Sử Dụng** | React 18, TypeScript, Vite, Socket.IO, Axios | [**Xem ngay**](#-công-nghệ-sử-dụng-tech-stack) |
| **02** | 🌟 **Tính Năng Chi Tiết** | **8 Phân hệ tính năng cốt lõi của Frontend** | [**Xem ngay**](#-tính-năng-chi-tiết-detailed-features) |
| ↳ | 🎬 *1. Trang Chủ & Khám Phá Phim* | Hero Slider, Đặt vé nhanh 4 bước, Tab lọc phim, Lịch chiếu | [Chi tiết](#1-trang-chủ--khám-phá-phim-home--discovery) |
| ↳ | 💺 *2. Sơ Đồ Ghế & Đặt Vé Realtime* | Ma trận ghế động, Giữ ghế Socket, Áp dụng Voucher, Vé QR | [Chi tiết](#2-sơ-đồ-ghế--đặt-vé-realtime-seat-map--booking) |
| ↳ | 🔔 *3. Hệ Thống Thông Báo Phân Quyền* | Chuông thông báo & Toast nổi, tách riêng Khách hàng & Admin | [Chi tiết](#3-hệ-thống-thông-báo-phân-quyền-role-based-notifications) |
| ↳ | 🎁 *4. Ví Voucher & Ưu Đãi* | Quản lý kho mã giảm giá, mức giảm, hạn dùng | [Chi tiết](#4-ví-voucher--ưu-đãi-voucher-wallet) |
| ↳ | 🎫 *5. Quản Lý Vé & Hủy Vé* | Lịch sử vé, mã QR check-in, hủy vé tự động giải phóng ghế | [Chi tiết](#5-quản-lý-vé--hủy-vé-trực-tuyến-my-tickets) |
| ↳ | 👤 *6. Quản Lý Tài Khoản Người Dùng* | Đăng nhập/Đăng ký JWT, sửa hồ sơ, đổi mật khẩu | [Chi tiết](#6-quản-lý-tài-khoản-người-dùng-user-profile) |
| ↳ | 🛡️ *7. Bảng Quản Trị Viên (Admin)* | Quản lý phim, suất chiếu, phòng chiếu, duyệt vé, tặng voucher | [Chi tiết](#7-bảng-điều-khiển-quản-trị-viên-admin-panel) |
| ↳ | 🤖 *8. Trợ Lý AI & Tiện Ích* | Chatbot AI tư vấn, Drawer Menu di động, Chính sách rạp | [Chi tiết](#8-trợ-lý-ảo-ai-chatbot--tiện-ích) |
| **03** | 📁 **Cấu Trúc Thư Mục** | Sơ đồ cây thư mục & trách nhiệm từng component | [**Xem ngay**](#-cấu-trúc-thư-mục-source-code) |
| **04** | 🛠️ **Cài Đặt & Khởi Chạy** | Cấu hình `.env`, lệnh chạy Development & Build Production | [**Xem ngay**](#-hướng-dẫn-cài-đặt--khởi-chạy) |

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

| Công nghệ | Vai trò / Mô tả |
| :--- | :--- |
| **React 18** | Thư viện UI xây dựng Single Page Application (SPA) hiệu năng cao |
| **TypeScript** | Định kiểu tĩnh an toàn, giảm thiểu lỗi runtime cho toàn bộ dự án |
| **Vite** | Build tool và Dev server tốc độ cao với Hot Module Replacement (HMR) |
| **Socket.IO Client** | Kết nối WebSocket Realtime đồng bộ giữ ghế, giải phóng ghế và thông báo tức thời |
| **Axios** | HTTP Client xử lý gọi RESTful API với interceptor quản lý JWT Token tự động |
| **Lucide React** | Bộ icon SVG hiện đại, đồng bộ phong cách thiết kế |
| **Vanilla CSS / CSS Variables** | Hệ thống Design System tông màu Cinema sang trọng, hỗ trợ Glassmorphism và Responsive |

---

## 🌟 Tính Năng Chi Tiết (Detailed Features)

### 1. Trang Chủ & Khám Phá Phim (Home & Discovery)
- **Hero Banner Slider (`HeroBanner.tsx`)**: Trình chiếu các bom tấn đang chiếu rạp nổi bật nhất với hiệu ứng chuyển cảnh mượt mà, trailer preview và nút đặt vé nhanh.
- **Thanh Đặt Vé Nhanh 4 Bước (`QuickBookingBar.tsx`)**:
  - Chọn Phim (phân nhóm rõ ràng: `🔥 PHIM ĐANG CHIẾU` và `⏳ PHIM SẮP CHIẾU`).
  - Chọn Rạp / Phòng Chiếu (Standard, IMAX, VIP, Couple).
  - Chọn Ngày chiếu (Hôm nay, Ngày mai, các ngày tiếp theo).
  - Chọn Khung giờ chiếu và chuyển thẳng đến sơ đồ ghế.
- **Lịch Chiếu Trực Tiếp Theo Ngày (`ShowtimeScheduleSection.tsx`)**: Xem toàn bộ lịch chiếu theo từng ngày trong tuần và lọc theo từng loại phòng chiếu.
- **Gợi Ý Phim Thịnh Hành (`MovieRecommendations.tsx`)**: Đề xuất các bộ phim hot, được đánh giá cao.
- **Bộ Lọc Phim Đang Chiếu / Sắp Chiếu Thông Minh**:
  - Các nút Tab Pill hiện đại hiển thị số lượng phim thực tế: `🔥 PHIM ĐANG CHIẾU (X)`, `⏳ PHIM SẮP CHIẾU (Y)`, `🎬 TẤT CẢ (Z)`.
  - Banner ngữ cảnh tự động đổi màu và nội dung theo từng tab.
  - Phân trang (Pagination) thông minh dạng số trang.
- **Thẻ Phim Trực Quan (`MovieCard.tsx`)**:
  - **Phim Đang Chiếu**: Badge đỏ rực rỡ `🔥 ĐANG CHIẾU` có chấm xanh Realtime nhấp nháy, hiển thị các nút chọn nhanh suất chiếu hôm nay (`14:30 STD`, `19:00 VIP`), nút `⚡ Mua Vé Ngay`.
  - **Phim Sắp Chiếu**: Badge xanh `⏳ SẮP CHIẾU`, hiển thị ngày khởi chiếu dự kiến `📅 Khởi chiếu: DD/MM/YYYY`, nút `▶ Xem Trailer & Chi Tiết`.
- **Modal Chi Tiết Phim (`MovieDetailModal.tsx`)**: Xem mô tả nội dung, diễn viên, đạo diễn, thời lượng, trailer và bảng chọn suất chiếu trực tiếp.

---

### 2. Sơ Đồ Ghế & Đặt Vé Realtime (Seat Map & Booking)
- **Sơ Đồ Rạp Chiếu Động (`SeatMap.tsx`)**:
  - Hiển thị trực quan vị trí Màn hình và toàn bộ ma trận ghế theo hàng (A, B, C,...) và cột (1, 2, 3,...).
  - Phân biệt rõ loại ghế: **Ghế Thường (Standard)**, **Ghế VIP**, **Ghế Đôi (Couple)** kèm mức giá tương ứng.
- **Cơ Chế Giữ Ghế Realtime (Seat Hold Timer)**:
  - Khi người dùng chọn ghế, hệ thống gửi socket giữ ghế tạm thời (mặc định 5 phút).
  - Hiển thị đồng hồ đếm ngược trực quan.
  - Khóa ghế tức thì đối với các người dùng khác đang cùng xem sơ đồ ghế nhằm chống đặt trùng (Race condition).
  - Thuật toán `seatAlgorithm.ts` kiểm tra tính hợp lệ của việc chọn ghế (tránh để trống 1 ghế đơn lẻ vô lý).
- **Tích Hợp Ví Voucher Khi Thanh Toán**:
  - Hiển thị danh sách Voucher cá nhân dạng thẻ trực quan ngay trên màn hình thanh toán.
  - Áp dụng hoặc hủy mã giảm giá với 1 cú click (1-click Apply/Remove).
  - Hỗ trợ nhập mã Voucher thủ công nếu có mã ưu đãi.
  - Tự động trừ tiền và hiển thị chi tiết: Giá gốc, Giảm giá Voucher, Tổng thanh toán cuối cùng.
- **Phương Thức Thanh Toán Linh Hoạt**: Hỗ trợ MoMo QR, VietQR / Chuyển khoản ngân hàng, ZaloPay.
- **Xuất Vé Điện Tử (`TicketModal.tsx`)**:
  - Hiển thị thông tin vé chi tiết, mã đơn vé, mã QR Check-in điện tử tại quầy rạp.

---

### 3. Hệ Thống Thông Báo Phân Quyền (Role-Based Notifications)
- **Chuông Thông Báo (`NotificationDropdown.tsx`)**:
  - Nằm cạnh Avatar người dùng với huy hiệu (badge) đếm số thông báo chưa đọc.
  - Đánh dấu đã đọc từng thông báo hoặc toàn bộ thông báo.
- **Phân Tách Nội Dung Thông Báo Riêng Biệt**:
  - **Khách Hàng (User)**:
    - Nhận thông báo đặt vé thành công: `⏳ ĐẶT VÉ THÀNH CÔNG - ĐANG CHỜ DUYỆT` (bấm vào mở mục "Vé của tôi").
    - Nhận thông báo khi vé được admin duyệt: `🎟️ VÉ XEM PHIM ĐÃ ĐƯỢC DUYỆT!`.
    - Nhận thông báo hủy vé: `❌ ĐƠN VÉ ĐÃ ĐƯỢC HỦY`.
    - Nhận thông báo khi được ban quản trị tặng voucher: `🎁 BẠN ĐƯỢC TẶNG VOUCHER MỚI!`.
  - **Quản Trị Viên (Admin)**:
    - Nhận thông báo độc quyền: `🔔 ĐƠN ĐẶT VÉ MỚI CẦN DUYỆT` (ghi rõ **Họ tên khách**, **Email**, **Tên phim**, **Danh sách ghế**, **Tổng tiền**).
    - Bấm vào thông báo sẽ tự động mở thẳng **Admin Panel** để kiểm tra và duyệt đơn vé.
  - **Bảo Mật**: Các tài khoản khác hoàn toàn không nhận được thông báo riêng của người khác.
- **Toast Nổi Realtime (`App.tsx`)**: Popup thông báo nhanh trên góc phải màn hình khi có sự kiện mới (vé được duyệt, có khách hủy vé nhả ghế trống `seat:freed`, thông báo admin,...).

---

### 4. Ví Voucher & Ưu Đãi (Voucher Wallet)
- **Modal Ví Voucher Riêng Biệt (`VoucherModal.tsx`)**:
  - Quản lý kho voucher cá nhân được ban quản trị tặng hoặc voucher chung của hệ thống.
  - Hiển thị phần trăm giảm giá / tiền mặt, mức giảm tối đa, đơn hàng tối thiểu, ngày hết hạn và trạng thái hiệu lực.
  - Sao chép mã nhanh để sử dụng khi đặt vé.

---

### 5. Quản Lý Vé & Hủy Vé Trực Tuyến (My Tickets)
- **Quản Lý Lịch Sử Đặt Vé (`MyTicketsModal.tsx`)**:
  - Phân loại vé theo trạng thái: **Đang Chờ Duyệt (Pending)**, **Đã Xác Nhận (Confirmed)**, **Đã Hủy (Cancelled)**.
  - Hiển thị mã QR vé điện tử, thông tin phòng chiếu, thời gian chiếu, vị trí ghế ngồi.
- **Chính Sách Hủy Vé Tự Động**:
  - Khách hàng có thể tự hủy vé trực tuyến nếu còn trước giờ chiếu ít nhất X tiếng (cấu hình bởi chính sách rạp).
  - Khi hủy vé, hệ thống tự động giải phóng ghế trên WebSocket tức thời và thông báo cơ hội đặt vé mới cho người dùng khác.

---

### 6. Quản Lý Tài Khoản Người Dùng (User Profile)
- **Đăng Nhập / Đăng Ký (`AuthModal.tsx`)**: Xác thực tài khoản an toàn với JWT, hỗ trợ phân quyền User và Admin.
- **Chỉnh Sửa Hồ Sơ (`ProfileModal.tsx`)**:
  - Cập nhật Họ và tên, Email.
  - Đổi mật khẩu tài khoản.
  - Thông báo Toast phản hồi thành công tức thì.

---

### 7. Bảng Điều Khiển Quản Trị Viên (Admin Panel)
- **Dành riêng cho tài khoản có quyền `ADMIN` (`AdminModal.tsx`)**:
  - 🎬 **Quản lý Phim**: Thêm mới, chỉnh sửa thông tin, xóa phim, chuyển trạng thái giữa *Đang Chiếu* và *Sắp Chiếu*.
  - 🕒 **Quản lý Suất Chiếu**: Tạo suất chiếu theo phim, phòng chiếu, giá vé và khung giờ chiếu linh hoạt.
  - 🏛️ **Quản lý Phòng Chiếu**: Thiết lập cấu hình phòng chiếu (Standard, IMAX, VIP, Couple), số hàng, số cột.
  - 📋 **Quản lý & Duyệt Vé**: Xem danh sách các đơn đặt vé của khách hàng, phê duyệt đơn vé (Confirm), tự động gửi thông báo và email xác nhận cho khách hàng.
  - 🎁 **Quản lý & Tặng Voucher**: Tạo voucher mới, quy định chính xác ngày hết hạn, tặng voucher riêng cho từng khách hàng cụ thể.
  - ⚙️ **Cài Đặt Hệ Thống & Chính Sách**: Cập nhật thông tin hotline, email hỗ trợ, QR chuyển khoản ngân hàng, thời hạn cắt giờ hủy vé (Cutoff hours).

---

### 8. Trợ Lý Ảo AI Chatbot & Tiện Ích
- **AI Chatbot Tư Vấn (`AIChatWidget.tsx`)**:
  - Hỗ trợ giải đáp thắc mắc, gợi ý phim phù hợp theo thể loại, hướng dẫn quy trình đặt vé và chính sách rạp.
- **Slide-in Drawer Menu (`SlideInMenu.tsx`)**: Menu dạng thanh trượt mượt mà cho trải nghiệm tối ưu trên thiết bị di động và máy tính bảng.
- **Chính Sách & Quy Định (`PolicyModal.tsx`)**: Xem chi tiết Điều khoản dịch vụ, Chính sách bảo mật, Quy chế chăm sóc khách hàng.
- **Thanh Tải Tiến Trình (`TopLoadingBar.tsx`)**: Hiệu ứng thanh tải trên đỉnh trang mỗi khi chuyển trang hoặc nạp dữ liệu.

---

## 📁 Cấu Trúc Thư Mục Source Code

```
frontend/
├── public/                     # Tệp tĩnh công khai
├── src/
│   ├── assets/                 # Hình ảnh, SVG, banner
│   ├── components/             # Các thành phần giao diện React
│   │   ├── common/             # Component tái sử dụng (RippleButton, SkeletonCard, SlideInMenu, TopLoadingBar)
│   │   ├── AdminModal.tsx      # Modal quản trị viên toàn diện
│   │   ├── AIChatWidget.tsx    # Widget trợ lý AI tư vấn phim
│   │   ├── AuthModal.tsx       # Modal đăng nhập / đăng ký
│   │   ├── Footer.tsx          # Chân trang & liên kết chính sách
│   │   ├── HeroBanner.tsx      # Banner slider các phim nổi bật
│   │   ├── MovieCard.tsx       # Thẻ phim hiển thị trạng thái & suất chiếu
│   │   ├── MovieDetailModal.tsx# Modal chi tiết phim & trailer
│   │   ├── MovieRecommendations.tsx # Gợi ý phim thịnh hành
│   │   ├── MyTicketsModal.tsx  # Quản lý vé của tôi & hủy vé
│   │   ├── Navbar.tsx          # Thanh điều hướng trên cùng & user dropdown
│   │   ├── NotificationDropdown.tsx # Chuông thông báo phân quyền
│   │   ├── PolicyModal.tsx     # Modal điều khoản & chính sách
│   │   ├── ProfileModal.tsx    # Chỉnh sửa thông tin tài khoản
│   │   ├── QuickBookingBar.tsx # Thanh đặt vé nhanh 4 bước
│   │   ├── SeatMap.tsx         # Sơ đồ ghế Realtime & áp dụng Voucher
│   │   ├── ShowtimeScheduleSection.tsx # Lịch chiếu theo ngày & phòng
│   │   ├── TicketModal.tsx     # Modal xuất vé điện tử sau thanh toán
│   │   └── VoucherModal.tsx    # Modal ví Voucher cá nhân
│   ├── services/
│   │   ├── api.ts              # Cấu hình Axios Client & Interceptor JWT
│   │   └── socket.ts           # Cấu hình kết nối WebSocket Socket.IO
│   ├── types/
│   │   └── index.ts            # Định nghĩa Interface & Type TypeScript
│   ├── utils/
│   │   └── seatAlgorithm.ts    # Thuật toán kiểm tra & tối ưu chọn ghế
│   ├── App.tsx                 # Component gốc điều phối trạng thái ứng dụng
│   ├── App.css                 # CSS bổ trợ cho ứng dụng
│   ├── index.css               # Hệ thống Style toàn cục & biến màu sắc
│   └── main.tsx                # Entry point khởi tạo React DOM
├── .env                        # Cấu hình biến môi trường (VITE_API_URL)
├── package.json                # Danh sách dependencies & scripts
├── tsconfig.json               # Cấu hình TypeScript
└── vite.config.ts              # Cấu hình Vite bundler
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18 trở lên.
- **NPM** hoặc **Yarn** / **PNPM**.
- Backend CINEVERSE đang chạy (mặc định tại `http://localhost:3000`).

### 2. Cấu Hình Biến Môi Trường (`.env`)
Tạo hoặc kiểm tra tệp `.env` tại thư mục gốc của frontend:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Cài Đặt Thư Viện
```bash
cd frontend
npm install
```

### 4. Khởi Chạy Môi Trường Phát Triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173` (hoặc cổng do Vite cung cấp).

### 5. Đóng Gói Ứng Dụng (Production Build)
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo ra sẵn sàng để deploy lên Vercel, Netlify hoặc Web Server Nginx/Docker.
