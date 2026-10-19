# Master Implementation Plan: Tối Ưu Hóa & Đồng Bộ Toàn Diện Dự Án

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giải quyết triệt để toàn bộ tồn đọng của dự án: đồng bộ hóa 100% Database SQL Server, triển khai cơ chế Refresh Token & bảo mật đa tầng, hoàn thiện phân quyền RBAC cho vai trò `STAFF` (Nhân viên) và `ADMIN`, dọn dẹp toàn bộ mock data rác, kết nối dữ liệu thật cho Quản lý Chuyến xe & Soát vé (Check-in), hợp nhất Client API và tổ chức cây thư mục chuẩn Clean Architecture.

**Architecture:** 
- Database: Tận dụng SQL Server với Stored Procedures và ACID Transactions cho nghiệp vụ đặt vé/thanh toán.
- Backend: Express 4 + TypeScript Strict theo kiến trúc 4 lớp (`routes -> controller -> service -> repository`). Bổ sung `refreshToken` với cơ chế xoay vòng và phân quyền RBAC phân cấp `ADMIN` vs `STAFF`.
- Frontend: React 19 + TypeScript + Tailwind v4 với 4-Tier State Management. Xây dựng `AdminLayout` đa tab thống nhất, bảo vệ trang nhạy cảm (`AdminOnlyRoute`), chuyển đổi các trang mock còn lại (`Trips`, `Bookings`) sang API thật và dọn dẹp các file rác.

**Tech Stack:** Microsoft SQL Server (tedious/mssql), Node.js, Express, TypeScript, Zod, JWT, bcrypt, React 19, Vite, Tailwind CSS v4, Axios, Lucide React.

---

## Global Constraints

- **KHÔNG THAY ĐỔI NHÁNH:** Luôn làm việc trực tiếp trên nhánh hiện tại (`fix/Optimize-Project`).
- **KHÔNG TỰ Ý CHẠY DB-RESET:** Tuyệt đối không chạy `db-reset.py` gây DROP database khi chưa được lệnh.
- **ZERO PLACEHOLDERS:** Nghiêm cấm dùng `// TODO`, `pass`, `...rest`. Mọi code phải hoàn chỉnh 100% AST/code.
- **ZERO N+1 & BLOCKING I/O:** Mọi truy vấn SQL tham số hóa (`@Param`), không nối chuỗi.
- **CLEAN DIRECTORY:** Dọn sạch các thư mục rỗng và file mock data thừa.
- **TIÊU CHUẨN THỬ NGHIỆM:** Xác nhận `npx tsc --noEmit` đạt exit code 0 ở cả server và client sau mỗi task.

---

## Review Focus (5 Trọng Điểm Kiểm Tra)

1. **Token Expiration & Refresh Failure:** Khi Access Token hết hạn, client phải tự động gọi `/api/public/refresh-token` và thử lại request bị gián đoạn mà không văng ra màn hình đăng nhập.
2. **Staff Permission Perimeter:** Tài khoản `STAFF` đăng nhập vào Admin chỉ được thao tác Chuyến xe, Bán vé, Soát vé; khi cố tình truy cập Quản lý tài khoản hoặc Báo cáo doanh thu phải bị chặn ngay với thông báo *"Bạn không có quyền xem trang này"* (403 Forbidden).
3. **Seat Matrix Concurrency:** Hai phiên đặt vé đồng thời chọn cùng 1 ghế trên chuyến xe: chỉ 1 phiên thành công (`sp_GiuCho` khóa bi quan XLOCK), phiên còn lại báo lỗi 409 *"Ghế đã được giữ hoặc đã bán"*.
4. **Data Seed Completeness:** Dữ liệu khởi tạo phải có đầy đủ các tuyến mặc định (Hà Nội <-> Ninh Bình, Sài Gòn <-> Đà Lạt) với các chuyến xe có ngày khởi hành tính tương đối theo `SYSDATETIME()` để người dùng test tìm kiếm luôn có dữ liệu.
5. **No Broken Links / Dual API:** Mọi route trên Header và Sidebar đều điều hướng chính xác, không còn tình trạng fallback về `/` do thiếu định tuyến.

---

## Phân Rã Công Việc (Work Breakdown Structure)

```
Plan: Tối ưu hóa dự án
├── Task 1: [Database] Đồng bộ Schema, Thêm Cột Bị Thiếu & Làm Giàu Seed Data
├── Task 2: [Backend - Auth] Triển khai Refresh Token & Chuẩn Hóa Biến Môi Trường
├── Task 3: [Backend - RBAC] Hoàn Thiện Phân Quyền Staff vs Admin Cho Toàn Bộ API
├── Task 4: [Frontend - Core] Hợp Nhất API Client & Cấu Hình Axios Tự Động Refresh Token
├── Task 5: [Frontend - Admin] Xây Dựng AdminLayout Thống Nhất & Phân Quyền UI Cho Staff
├── Task 6: [Frontend - Modules] Chuyển Đổi Admin Trips & Bookings/Check-in Sang API Thật
└── Task 7: [Cleanup & Audit] Dọn Dẹp File Rác (MockData, Stubs) & Kiểm Thử E2E Toàn Diện
```

---

### Task 1: [Database] Đồng bộ Schema, Thêm Cột Bị Thiếu & Làm Giàu Seed Data

**Files:**
- Modify: `database/scripts/01_schema.sql`
- Modify: `database/scripts/10_seed_data.sql`
- Test: `server/src/database/query.ts`

**Interfaces:**
- Produces: Cột `floor` (INT), `seat_type` (VARCHAR) trong bảng `seats`; bảng `route_stations`; Dữ liệu mẫu phong phú với 5 tài khoản test: Admin, Staff, 2 Tài xế, Khách hàng; các tuyến xe và chuyến xe tương đối với `SYSDATETIME()`.

- [ ] **Step 1: Cập nhật `01_schema.sql` và `10_seed_data.sql`**
  - Đảm bảo `seats` có `floor INT NOT NULL DEFAULT 1` và `seat_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL'`.
  - Thêm tài khoản Staff mẫu vào `10_seed_data.sql`:
    `('USR-STF-1', N'Nhân viên Bán vé', 'staff@example.com', '0902223334', '$2b$10$YkY11krULiw4eX1he6WTc.geoeTZRUw546k2uG4IaOmsI46vJNE7S', 'STAFF', 0, 1)`.
  - Thêm các chuyến xe `TRP-01` (Sài Gòn - Đà Lạt), `TRP-03` (Hà Nội - Ninh Bình hôm nay và ngày mai).
- [ ] **Step 2: Thực thi kiểm tra cấu trúc DB**
  - Chạy script kiểm tra `04_functions.sql`, `05_transactions.sql`, `06_triggers.sql`, `08_stored_procedures.sql`, `09_views.sql` đảm bảo 100% batch thành công không còn lỗi `Invalid column name`.
- [ ] **Step 3: Commit**
  ```bash
  git add database/scripts/
  git commit -m "fix(db): ensure schema parity and enrich seed data with staff account and trips"
  ```

---

### Task 2: [Backend - Auth] Triển khai Refresh Token & Chuẩn Hóa Biến Môi Trường

**Files:**
- Modify: `server/.env` & `server/.env.example`
- Modify: `server/src/config/env.ts`
- Modify: `server/src/modules/auth/auth.service.ts`
- Modify: `server/src/modules/auth/auth.controller.ts`
- Modify: `server/src/modules/auth/auth.routes.ts`

**Interfaces:**
- Consumes: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` từ `config/env.ts`.
- Produces: 
  - `POST /api/public/login` trả về `{ success: true, accessToken, refreshToken, user }`.
  - `POST /api/public/refresh-token` nhận `{ refreshToken }` trả về `{ success: true, accessToken }`.

- [ ] **Step 1: Viết test cho Refresh Token**
  - Test trường hợp `refreshToken` hợp lệ cấp `accessToken` mới.
  - Test trường hợp `refreshToken` hết hạn hoặc không hợp lệ trả về 401.
- [ ] **Step 2: Cập nhật biến môi trường trong `env.ts`**
  - Thêm `jwtRefreshSecret`, `jwtAccessExpiresIn`, `jwtRefreshExpiresIn`.
- [ ] **Step 3: Triển khai hàm `refreshToken` trong `auth.service.ts` và endpoint trong `auth.controller.ts`**
  - Xác thực token bằng `jwt.verify(refreshToken, env.jwtRefreshSecret)`.
  - Cấp mới Access Token với thời hạn cấu hình.
- [ ] **Step 4: Chạy `npx tsc --noEmit` xác thực sạch lỗi**
- [ ] **Step 5: Commit**
  ```bash
  git add server/src/modules/auth/ server/src/config/ server/.env.example
  git commit -m "feat(auth): implement refresh token mechanism and standardize env config"
  ```

---

### Task 3: [Backend - RBAC] Hoàn Thiện Phân Quyền Staff vs Admin Cho Toàn Bộ API

**Files:**
- Modify: `server/src/modules/index.ts`
- Modify: `server/src/modules/admin/admin.routes.ts`
- Modify: `server/src/modules/trips/trip.routes.ts`
- Modify: `server/src/modules/bookings/booking.routes.ts`
- Modify: `server/src/modules/reports/report.routes.ts`

**Interfaces:**
- Consumes: Middleware `verifyJWT`, `checkRole` từ `middlewares/auth.middleware.ts`.
- Produces:
  - Route `/api/private/admin/users`: Chỉ cho phép role `ADMIN`.
  - Route `/api/admin/reports`: Chỉ cho phép role `ADMIN`.
  - Route `/api/trips`, `/api/bookings`: Cho phép `ADMIN` và `STAFF`.
  - Route `/api/buses`, `/api/routes`, `/api/stations` (Admin): Cho phép `ADMIN` và `STAFF`.

- [ ] **Step 1: Thay thế `adminAuthPlaceholder` trong `server/src/modules/index.ts`**
  - Thay placeholder `next()` bằng `verifyJWT` và `checkRole(['ADMIN', 'STAFF'])`.
- [ ] **Step 2: Bảo vệ nghiêm ngặt báo cáo tài chính**
  - Thêm `checkRole(['ADMIN'])` cho `reportRoutes`.
- [ ] **Step 3: Bảo mật các route tạo/sửa/hủy chuyến**
  - Gắn `verifyJWT` và `checkRole(['ADMIN', 'STAFF'])` cho `tripRoutes` và `bookingRoutes`.
- [ ] **Step 4: Kiểm thử phân quyền qua script test API (Staff bị 403 khi vào users/reports)**
- [ ] **Step 5: Commit**
  ```bash
  git add server/src/modules/
  git commit -m "feat(security): enforce strict rbac for staff and admin endpoints"
  ```

---

### Task 4: [Frontend - Core] Hợp Nhất API Client & Cấu Hình Axios Tự Động Refresh Token

**Files:**
- Modify: `client/src/lib/api.ts`
- Modify: `client/src/services/api.ts` (Ủy quyền hoặc hợp nhất vào `lib/api.ts`)
- Modify: `client/src/contexts/AuthContext.tsx`
- Modify: `client/src/hooks/useAuth.ts`
- Modify: `client/.env.example`

**Interfaces:**
- Produces: Client API duy nhất với:
  - Tự động tiêm `Authorization: Bearer <accessToken>`.
  - Interceptor phản hồi bắt lỗi 401: gọi `POST /api/public/refresh-token`, cập nhật token mới và tự động thực thi lại request gốc (Request Queueing).
  - Lưu trữ an toàn `auth_token` và `refresh_token` trong localStorage.

- [ ] **Step 1: Nâng cấp `client/src/lib/api.ts`**
  - Bổ sung logic Request Retrying với cờ `isRefreshing` và hàng đợi `failedQueue`.
- [ ] **Step 2: Cập nhật `AuthContext.tsx`**
  - Lưu `refreshToken` khi đăng nhập thành công.
  - Xóa cả hai token khi logout.
- [ ] **Step 3: Chuyển hướng `client/src/services/api.ts` sang sử dụng instance Axios tập trung**
- [ ] **Step 4: Kiểm tra `npx tsc --noEmit` ở client**
- [ ] **Step 5: Commit**
  ```bash
  git add client/src/lib/ client/src/services/api.ts client/src/contexts/
  git commit -m "refactor(client): unify api client with silent refresh token interceptor"
  ```

---

### Task 5: [Frontend - Admin] Xây Dựng AdminLayout Thống Nhất & Phân Quyền UI Cho Staff

**Files:**
- Create: `client/src/pages/admin/AdminLayout.tsx`
- Create: `client/src/pages/admin/components/AdminSidebar.tsx` (hoặc Tabs bar)
- Modify: `client/src/router/index.tsx`
- Modify: `client/src/components/Header.tsx`
- Modify: `client/src/components/ProtectedRoute.tsx`

**Interfaces:**
- Produces: 
  - Giao diện Admin đa tab/sidebar gồm:
    1. **Chuyến xe** (`/admin/trips`): Admin + Staff
    2. **Đặt vé & Soát vé** (`/admin/bookings`): Admin + Staff
    3. **Tuyến đường** (`/admin/routes`): Admin + Staff
    4. **Bến xe** (`/admin/stations`): Admin + Staff
    5. **Phương tiện** (`/admin/buses`): Admin + Staff
    6. **Báo cáo doanh thu** (`/admin/reports`): CHỈ ADMIN
    7. **Người dùng & Phân quyền** (`/admin/users`): CHỈ ADMIN
  - Với tài khoản `STAFF`: Menu không hiển thị mục Báo cáo và Người dùng. Nếu gõ URL trực tiếp, màn hình hiển thị: *"Bạn không có quyền xem trang này (403 Forbidden)"*.

- [ ] **Step 1: Xây dựng `AdminLayout.tsx` và `AdminSidebar.tsx`**
  - Kiểm tra `user?.role`. Lọc danh sách tab điều hướng phù hợp với vai trò.
- [ ] **Step 2: Cập nhật `router/index.tsx`**
  - Đăng ký các route con dưới `/admin` được bảo vệ bởi vai trò `['ADMIN', 'STAFF']`.
  - Bọc các route con nhạy cảm (`/admin/users`, `/admin/reports`) bằng kiểm tra `allowedRoles={['ADMIN']}`.
- [ ] **Step 3: Cập nhật `Header.tsx`**
  - Hiển thị nút "Quản trị / Điều hành" cho cả ADMIN và STAFF, dẫn thẳng về `/admin`.
- [ ] **Step 4: Commit**
  ```bash
  git add client/src/pages/admin/ client/src/router/ client/src/components/
  git commit -m "feat(ui): implement unified admin layout with staff role-based view isolation"
  ```

---

### Task 6: [Frontend - Modules] Chuyển Đổi Admin Trips & Bookings/Check-in Sang API Thật

**Files:**
- Create: `client/src/pages/admin/AdminTripsPage.tsx`
- Create: `client/src/pages/admin/AdminBookingsPage.tsx`
- Modify: `client/src/services/trip.service.ts`
- Modify: `client/src/services/booking.service.ts`

**Interfaces:**
- Consumes:
  - `GET /api/trips` & `POST /api/trips` & `PATCH /api/trips/:id/status` từ backend.
  - `GET /api/bookings/lookup/:code` & `POST /api/bookings/check-in` từ backend.
- Produces:
  - Trang Quản lý Chuyến xe: Bảng chuyến xe thời gian thực từ API, lọc theo ngày/trạng thái/tuyến, modal thêm chuyến mới gọi `sp_TaoChuyen`.
  - Trang Soát vé & Đặt vé: Tra cứu vé theo mã vé/mã booking, nút bấm Soát vé (Check-in) gọi `sp_CheckIn` cập nhật trạng thái `CHECKED_IN` ngay trên giao diện.

- [ ] **Step 1: Hoàn thiện `trip.service.ts` và `booking.service.ts` với đầy đủ DTO và API call**
- [ ] **Step 2: Viết `AdminTripsPage.tsx` tái sử dụng `Table`, `Badge`, `Button`, `Modal` hiện có**
- [ ] **Step 3: Viết `AdminBookingsPage.tsx` tích hợp tính năng Check-in vé cho Staff/Admin**
- [ ] **Step 4: Kết nối vào `router/index.tsx` dưới `AdminLayout`**
- [ ] **Step 5: Kiểm tra `npx tsc --noEmit` đạt 0 lỗi**
- [ ] **Step 6: Commit**
  ```bash
  git add client/src/pages/admin/ client/src/services/ client/src/router/
  git commit -m "feat(admin): connect trips management and staff check-in to real backend apis"
  ```

---

### Task 7: [Cleanup & Audit] Dọn Dẹp File Rác & Kiểm Thử E2E Toàn Diện

**Files:**
- Delete: `server/src/modules/seats/` (file stubs rỗng)
- Delete: `server/src/modules/customers/` (file stubs rỗng)
- Delete: `server/src/modules/employees/` (file stubs rỗng)
- Delete: `server/src/modules/users/` (file stubs rỗng)
- Delete: `client/src/pages/UsersPage.tsx` (thay thế bởi `AdminDashboardPage`)
- Delete: `client/src/pages/TripsPage.tsx` (thay thế bởi `AdminTripsPage`)
- Delete: `client/src/pages/BookingPage.tsx` (thay thế bởi `AdminBookingsPage`)
- Delete: `client/src/pages/CustomersPage.tsx`, `DriversPage.tsx` (file mock cũ)
- Delete: `client/src/pages/StationsPage.tsx`, `VehiclesPage.tsx` (file re-export thừa)

- [ ] **Step 1: Dọn dẹp an toàn các file rỗng/thừa**
  - Rà soát các import để đảm bảo không còn file nào phụ thuộc vào các trang cũ.
- [ ] **Step 2: Kiểm tra biên dịch Server & Client**
  - Chạy `npx tsc --noEmit` ở cả `server/` và `client/`.
- [ ] **Step 3: Khởi chạy môi trường Dev & Test luồng**
  - Đăng nhập quyền `STAFF`: Test tra cứu vé, soát vé, quản lý chuyến xe; xác nhận bị chặn khi vào Báo cáo & Người dùng.
  - Đăng nhập quyền `ADMIN`: Toàn quyền thao tác 7 phân hệ.
  - Luồng khách hàng: Tìm chuyến -> Đặt chỗ -> Thanh toán QR -> Thành công.
- [ ] **Step 4: Commit hoàn tất**
  ```bash
  git add -A
  git commit -m "chore(cleanup): remove legacy mock pages and stubs, finalize clean production architecture"
  ```
