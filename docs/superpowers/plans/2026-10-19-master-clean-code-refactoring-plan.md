# Master Clean Code & Architecture Refactoring Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tái cấu trúc toàn diện Client và Server đạt chuẩn Clean Architecture cấp Senior: lấp đầy toàn bộ các service còn trống (`auth.service.ts`, `user.service.ts`, `driver.service.ts`), trục xuất 100% mã mạng Axios và xử lý lỗi tầng thấp ra khỏi các UI Component, xóa bỏ sự phân mảnh giữa 2 thư mục `components/ui` và `components/common`, chuẩn hóa Container/Presentational Pattern qua Custom Hooks và chia nhỏ các trang nguyên khối (>500 dòng) thành các module con tái sử dụng cao, logic chặt chẽ, không sinh bloat.

**Architecture:**
- **Service Layer (Độc lập & Trừu tượng hóa hoàn toàn):**
  - Mọi API call tập trung trong `client/src/services/` (`auth`, `user`, `driver`, `trip`, `booking`, `bus`, `station`, `route`, `report`, `payment`).
  - Giao diện UI **TUYỆT ĐỐI KHÔNG** import `axios`, `AxiosError`, hay gọi `api` trực tiếp. Mọi tương tác dữ liệu, bắt lỗi và parse response đều do Service đảm nhiệm.
- **Unified Design System (`client/src/components/common`):**
  - Hợp nhất duy nhất 1 nguồn chân lý cho các thành phần UI nền tảng (`Button`, `Input`, `Select`, `Badge`, `Modal`, `Table`, `Alert`, `Card`, `Drawer`, `EmptyState`, `Toast`).
  - Xóa bỏ triệt để các file re-export hoặc trùng lặp trong `client/src/components/ui/`.
- **Container / Custom Hook Pattern:**
  - Tách biệt State & Business Actions khỏi View JSX: `useAuth`, `useAdminUsers`, `useAdminTrips`, `useBookingCheckIn`, `useDriverSchedules`.
  - UI Component chỉ đảm nhận Presentational logic (render giao diện, bind sự kiện qua hook), giữ mỗi file dưới 200 dòng, dễ đọc, dễ kiểm thử.

**Tech Stack:** React 19, TypeScript (Strict), Vite, Tailwind CSS v4, Axios, React Hook Form + Zod, Lucide React, Express 5, SQL Server.

---

## Global Constraints

- **NHÁNH DUY NHẤT:** Tuyệt đối giữ nhánh `fix/Optimize-Project`, không tạo nhánh mới hoặc checkout nhánh khác.
- **ZERO RAW NETWORK CALLS IN UI:** Nghiêm cấm UI Components (`pages/`, `components/`) import `axios` hoặc `lib/api`. Phải đi qua `services/` hoặc `hooks/`.
- **ZERO PLACEHOLDERS:** Cấm `// TODO`, `pass`, `...rest`. Mọi hàm phải có thân hàm thực thi hoàn chỉnh và types an toàn.
- **CLEAN DIRECTORY INVARIANT:** Không để file rỗng (như `auth.service.ts` trước đây) hoặc folder trùng lặp gây nhiễu (`components/ui` vs `components/common`).
- **COMPILER VERIFICATION:** Mọi Task hoàn thành đều phải vượt qua `npx tsc --noEmit` (exit code 0 ở cả `server` và `client`) và `npm run lint` (exit code 0 ở `client`).

---

## Review Focus (5 Trọng Điểm Đánh Giá Chuẩn Senior)

1. **Complete Service Abstraction:** `auth.service.ts`, `user.service.ts`, `driver.service.ts` cung cấp đầy đủ các hàm nghiệp vụ, trả về đúng interface DTO, tự động bóc tách lỗi máy chủ thân thiện, UI không cần biết HTTP status code hay Axios response format.
2. **Unified UI Design System:** Toàn bộ dự án chỉ import Atomic Components từ `@/components/common` (hoặc `../components/common`). Thư mục `components/ui` trùng lặp được dọn sạch mà không gây vỡ bất kỳ màn hình nào.
3. **Decoupled Event Handlers & Clean Hooks:** Các hàm xử lý `onClick`, `onSubmit` trong màn hình UI không chứa logic mutate mạng phức tạp, mà chỉ gọi các action từ Custom Hook / Service.
4. **Decomposition of Monolithic Pages:** `AdminTripsPage.tsx` và `AdminBookingsPage.tsx` được phân rã thành các thư mục con có trách nhiệm đơn nhất (`trips/`, `bookings/`).
5. **Runtime Integrity:** Mọi luồng Đăng nhập, Đăng ký, Cấp mới Token, Phân quyền Admin/Staff, Tra cứu vé, Soát vé, Quản lý người dùng, Xem báo cáo chạy trơn tru 100% trên dev server.

---

## Phân Rã Công Việc (Work Breakdown Structure)

```
Plan: Tái Cấu Trúc Toàn Diện & Clean Code Chuẩn Senior
├── Task 1: [Services] Hoàn thiện Auth, User & Driver Services Độc Lập
├── Task 2: [UI System] Hợp Nhất Hệ Thống Component Nền Tảng Vào components/common
├── Task 3: [Auth UI] Tái Cấu Trúc LoginPage & RegisterPage Qua AuthService & Hooks
├── Task 4: [Admin Users] Tái Cấu Trúc AdminDashboardPage Với UserService & Sub-Components
├── Task 5: [Admin Trips] Phân Rã AdminTripsPage Thành Thư Mục trips/ Tinh Gọn
├── Task 6: [Admin Bookings] Phân Rã AdminBookingsPage Thành Thư Mục bookings/ Tinh Gọn
├── Task 7: [Driver Portal] Chuẩn Hóa DriverSchedulesPage Sử Dụng DriverService
└── Task 8: [Verification & Audit] Kiểm Thử Typecheck, Lint, Runtime & Git History Sạch
```

---

### Task 1: [Services] Hoàn thiện Auth, User & Driver Services Độc Lập

**Files:**
- Modify: `client/src/services/auth.service.ts`
- Create: `client/src/services/user.service.ts`
- Create: `client/src/services/driver.service.ts`
- Test: `client/src/services/__tests__/services.test.ts` (hoặc verification script)

**Interfaces:**
- Produces:
  ```ts
  // auth.service.ts
  export interface LoginCredentials { phone: string; password: string; }
  export interface RegisterPayload { fullName: string; phone: string; email: string; password: string; }
  export interface AuthUser { userId: string; fullName: string; phone: string; role: 'ADMIN' | 'STAFF' | 'DRIVER' | 'CUSTOMER'; email: string; }
  export interface AuthResult { token: string; accessToken: string; refreshToken: string; user: AuthUser; }
  export interface RefreshTokenResult { token: string; accessToken: string; }

  export const authService = {
    login: (credentials: LoginCredentials) => Promise<AuthResult>,
    register: (payload: RegisterPayload) => Promise<{ success: boolean; message: string }>,
    refreshToken: (refreshToken: string) => Promise<RefreshTokenResult>,
    getCurrentUser: () => Promise<AuthUser>,
    logout: () => void,
  };

  // user.service.ts
  export const userService = {
    getAllUsers: () => Promise<AdminUser[]>,
    createUser: (data: CreateUserInput) => Promise<AdminUser>,
    updateUser: (userId: string, data: UpdateUserInput) => Promise<AdminUser>,
    toggleUserStatus: (userId: string, isActive: boolean) => Promise<AdminUser>,
  };

  // driver.service.ts
  export const driverService = {
    getSchedules: () => Promise<DriverScheduleDto[]>,
  };
  ```

- [ ] **Step 1: Viết hoàn chỉnh `auth.service.ts`**
  - Triển khai `login`, `register`, `refreshToken`, `getCurrentUser`, `logout` sử dụng instance `api` từ `client/src/services/api.ts`.
  - Xử lý tương thích ngược payload và chuẩn hóa exception `ApiError`.
- [ ] **Step 2: Tạo mới `user.service.ts`**
  - Đóng gói toàn bộ các endpoint `/private/admin/users`, `/private/admin/users/:id`, `/private/admin/users/:id/status`.
- [ ] **Step 3: Tạo mới `driver.service.ts`**
  - Đóng gói endpoint `/private/driver/schedules`.
- [ ] **Step 4: Kiểm tra compile `npx tsc --noEmit` ở client**
- [ ] **Step 5: Commit**
  ```bash
  git add client/src/services/
  git commit -m "feat(services): implement comprehensive auth, user, and driver services"
  ```

---

### Task 2: [UI System] Hợp Nhất Hệ Thống Component Nền Tảng Vào `components/common`

**Files:**
- Modify: `client/src/components/common/Badge.tsx` (tích hợp role & status variants)
- Modify: `client/src/components/common/index.ts` (barrel export đầy đủ)
- Delete: `client/src/components/ui/` (dọn sạch các file trùng lặp và re-export rác)
- Modify: Các file import từ `components/ui/` chuyển sang `components/common/`

**Interfaces:**
- Produces: Hệ thống component thống nhất tại `client/src/components/common/`:
  - `Button`, `Input`, `Select`, `Badge`, `Modal`, `Table`, `Alert`, `Card`, `Drawer`, `EmptyState`, `Toast`.
  - `Badge` hỗ trợ cả 2 dạng: semantic color (`success`, `warning`, `danger`, `neutral`, `brand`, `action`) và domain badges (`role`, `status`).

- [ ] **Step 1: Mở rộng `Badge.tsx` trong `components/common`**
  - Hỗ trợ thêm props `role?: UserRole` và `isActive?: boolean` để tương thích hoàn toàn với các trang quản trị.
- [ ] **Step 2: Thêm `Alert.tsx` vào `components/common/Alert.tsx`**
  - Đảm bảo có đầy đủ 4 variants: `info`, `success`, `warning`, `error`.
- [ ] **Step 3: Cập nhật barrel export `components/common/index.ts`**
- [ ] **Step 4: Quét toàn bộ codebase và thay thế các import `from '.../components/ui/...'` sang `components/common`**
- [ ] **Step 5: Xóa bỏ an toàn thư mục `client/src/components/ui/`**
- [ ] **Step 6: Kiểm tra `npx tsc --noEmit` và `npm run lint`**
- [ ] **Step 7: Commit**
  ```bash
  git add client/src/components/ client/src/pages/
  git commit -m "refactor(ui): unify atomic design components into components/common and remove ui duplication"
  ```

---

### Task 3: [Auth UI] Tái Cấu Trúc LoginPage & RegisterPage Qua AuthService & Hooks

**Files:**
- Modify: `client/src/pages/LoginPage.tsx`
- Modify: `client/src/pages/RegisterPage.tsx`
- Modify: `client/src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: `authService.login()`, `authService.register()` từ `services/auth.service.ts`.
- Produces: 
  - `LoginPage` và `RegisterPage` sạch sẽ, không còn bất kỳ dòng code Axios nào.
  - Xử lý lỗi thông qua `ApiError` chuẩn hóa, thông báo lỗi người dùng rõ ràng, thân thiện.

- [ ] **Step 1: Cập nhật `LoginPage.tsx`**
  - Thay thế `api.post(...)` bằng `authService.login(data)`.
  - Loại bỏ các khối try-catch 404 Axios fallback trong UI.
  - Sử dụng components từ `components/common`.
- [ ] **Step 2: Cập nhật `RegisterPage.tsx`**
  - Thay thế `api.post(...)` bằng `authService.register(payload)`.
  - Tách bạch thông báo lỗi qua `err instanceof ApiError ? err.message : '...'`.
- [ ] **Step 3: Kiểm tra compile & lint ở client**
- [ ] **Step 4: Commit**
  ```bash
  git add client/src/pages/LoginPage.tsx client/src/pages/RegisterPage.tsx client/src/contexts/
  git commit -m "refactor(auth-ui): decouple LoginPage and RegisterPage from low-level network calls using authService"
  ```

---

### Task 4: [Admin Users] Tái Cấu Trúc AdminDashboardPage Với UserService & Sub-Components

**Files:**
- Create: `client/src/hooks/useAdminUsers.ts` (quản lý state, fetch, toggle status, form submit)
- Modify: `client/src/pages/admin/AdminDashboardPage.tsx`
- Modify: `client/src/pages/admin/components/UserTable.tsx`
- Modify: `client/src/pages/admin/components/UserFormModal.tsx`

**Interfaces:**
- Consumes: `userService` từ `services/user.service.ts`.
- Produces:
  - Custom Hook `useAdminUsers`: cung cấp `{ users, isLoading, error, refresh, toggleStatus, saveUser }`.
  - `AdminDashboardPage` tinh gọn (< 100 dòng), phân chia trách nhiệm rõ ràng.

- [ ] **Step 1: Viết Hook `useAdminUsers.ts`**
  - Đóng gói toàn bộ logic tải danh sách người dùng, Optimistic Update khi khóa/mở tài khoản, và gọi API thêm/sửa qua `userService`.
- [ ] **Step 2: Tối ưu `AdminDashboardPage.tsx`**
  - Thay thế toàn bộ state nội bộ và các hàm Axios thủ công bằng hook `useAdminUsers`.
  - Giữ lại thanh tìm kiếm, bộ lọc vai trò và kết nối trực tiếp với `UserTable` và `UserFormModal`.
- [ ] **Step 3: Kiểm tra `npx tsc --noEmit`**
- [ ] **Step 4: Commit**
  ```bash
  git add client/src/hooks/useAdminUsers.ts client/src/pages/admin/
  git commit -m "refactor(admin-users): extract useAdminUsers hook and delegate mutations to userService"
  ```

---

### Task 5: [Admin Trips] Phân Rã AdminTripsPage Thành Thư Mục trips/ Tinh Gọn

**Files:**
- Create: `client/src/pages/admin/trips/components/TripFilterBar.tsx`
- Create: `client/src/pages/admin/trips/components/TripTable.tsx`
- Create: `client/src/pages/admin/trips/components/CreateTripModal.tsx`
- Create: `client/src/pages/admin/trips/hooks/useAdminTrips.ts`
- Rewrite: `client/src/pages/admin/AdminTripsPage.tsx` (chuyển thành container gọn nhẹ hoặc re-export từ `trips/AdminTripsPage.tsx`)

**Interfaces:**
- Consumes: `tripService`, `routeService`, `busService`.
- Produces: Cấu trúc mô-đun hóa cho phân hệ Quản lý Chuyến xe:
  - `useAdminTrips`: Quản lý danh sách chuyến xe, nạp tuyến và xe, chuyển đổi trạng thái (`changeStatus`, `cancelTrip`, `createTrip`).
  - `TripFilterBar`: Tìm kiếm biển số, mã chuyến, lọc trạng thái và ngày khởi hành.
  - `TripTable`: Bảng chuyến xe thời gian thực với các nút hành động phân quyền.
  - `CreateTripModal`: Form thêm chuyến xe mới có validate thời gian và giá vé.

- [ ] **Step 1: Tạo hook `useAdminTrips.ts`**
  - Quản lý logic fetch song song `tripService.getAdminTrips`, `routeService.getAllRoutes`, `busService.getAllBuses`.
  - Cung cấp các hành động: `handleCreateTrip`, `handleChangeStatus`, `handleCancelTrip`.
- [ ] **Step 2: Tách các sub-component `TripFilterBar`, `TripTable`, `CreateTripModal`**
- [ ] **Step 3: Ghép nối lại `AdminTripsPage.tsx` tối giản, thanh lịch, dễ bảo trì**
- [ ] **Step 4: Kiểm tra `npx tsc --noEmit` & `npm run lint`**
- [ ] **Step 5: Commit**
  ```bash
  git add client/src/pages/admin/trips/ client/src/pages/admin/AdminTripsPage.tsx
  git commit -m "refactor(admin-trips): modularize AdminTripsPage with dedicated hook and sub-components"
  ```

---

### Task 6: [Admin Bookings] Phân Rã AdminBookingsPage Thành Thư Mục bookings/ Tinh Gọn

**Files:**
- Create: `client/src/pages/admin/bookings/components/BookingLookupCard.tsx`
- Create: `client/src/pages/admin/bookings/components/TripManifestTable.tsx`
- Create: `client/src/pages/admin/bookings/hooks/useBookingManagement.ts`
- Rewrite: `client/src/pages/admin/AdminBookingsPage.tsx`

**Interfaces:**
- Consumes: `bookingService.getBookingByCode()`, `bookingService.getTripTickets()`, `bookingService.checkInTicket()`.
- Produces: Cấu trúc mô-đun hóa cho phân hệ Soát vé & Đặt vé:
  - `useBookingManagement`: Quản lý tra cứu vé, tải danh sách manifest theo chuyến, và thao tác check-in thời gian thực.
  - `BookingLookupCard`: Thẻ tra cứu nhanh mã vé với kết quả chi tiết hành khách, số ghế, trạng thái.
  - `TripManifestTable`: Bảng danh sách hành khách toàn chuyến kèm nút bấm Check-in tức thì.

- [ ] **Step 1: Viết hook `useBookingManagement.ts`**
- [ ] **Step 2: Xây dựng các component con độc lập**
- [ ] **Step 3: Tối ưu lại `AdminBookingsPage.tsx` với 2 tab rõ ràng: "Tra cứu & Soát vé nhanh" và "Danh sách theo chuyến"**
- [ ] **Step 4: Kiểm tra `npx tsc --noEmit` & `npm run lint`**
- [ ] **Step 5: Commit**
  ```bash
  git add client/src/pages/admin/bookings/ client/src/pages/admin/AdminBookingsPage.tsx
  git commit -m "refactor(admin-bookings): modularize AdminBookingsPage with clean sub-components and hook"
  ```

---

### Task 7: [Driver Portal] Chuẩn Hóa DriverSchedulesPage Sử Dụng DriverService

**Files:**
- Modify: `client/src/pages/driver/DriverSchedulesPage.tsx`
- Modify: `client/src/pages/driver/components/DriverTripCard.tsx`

**Interfaces:**
- Consumes: `driverService.getSchedules()` từ `services/driver.service.ts`.
- Produces: Loại bỏ hoàn toàn Axios trực tiếp ra khỏi trang tài xế, sử dụng components từ `components/common`.

- [ ] **Step 1: Cập nhật `DriverSchedulesPage.tsx`**
  - Chuyển lệnh gọi `api.get('/private/driver/schedules')` sang `driverService.getSchedules()`.
  - Thay thế `components/ui/Button` và `Alert` bằng `components/common`.
- [ ] **Step 2: Kiểm tra compile & lint**
- [ ] **Step 3: Commit**
  ```bash
  git add client/src/pages/driver/
  git commit -m "refactor(driver-portal): migrate DriverSchedulesPage to driverService and common components"
  ```

---

### Task 8: [Verification & Audit] Kiểm Thử Typecheck, Lint, Runtime & Git History Sạch

**Files:**
- Test all: `client/` and `server/`

- [ ] **Step 1: Chạy Typecheck toàn bộ Monorepo**
  - Chạy `npx tsc --noEmit` ở `server/` (kỳ vọng: 0 lỗi).
  - Chạy `npx tsc --noEmit` ở `client/` (kỳ vọng: 0 lỗi).
- [ ] **Step 2: Chạy Linter**
  - Chạy `npm run lint` ở `client/` (kỳ vọng: 0 warnings, 0 errors).
- [ ] **Step 3: Runtime Smoke Test**
  - Khởi động backend (`npm run dev`) và frontend (`npm run dev`).
  - Kiểm tra login với Admin, Staff, Driver, Customer.
  - Xác nhận phân quyền UI, tra cứu vé, soát vé, refresh token mượt mà không lỗi console.
- [ ] **Step 4: Git Log & Tree Inspection**
  - Đảm bảo cây thư mục sạch sẽ, không còn file thừa, commit messages chuẩn Conventional Commits.
