# Driver Portal (Schedules) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng giao diện Cổng thông tin Tài xế (Driver Portal) chuyên biệt cho thiết bị di động (Mobile-First Card Layout) tại trang `DriverSchedulesPage.tsx`, tiêu thụ API backend có bảo vệ Anti-IDOR (`GET /api/private/driver/schedules`), hiển thị trực quan lộ trình chuyến xe, giờ khởi hành/đến, thông tin phương tiện (biển số, loại xe) và trạng thái chuyến đi với hiệu ứng thẩm mỹ RedBus cao cấp.

**Architecture:**
- **Mobile-First Card Architecture:** Thay vì hiển thị bảng dữ liệu (`<Table>`) dạng lưới ngang gây tràn màn hình trên điện thoại, trang lịch trình tài xế được thiết kế theo dạng danh sách Thẻ độc lập xếp chồng dọc (`Vertical Stack of Cards`). Mỗi thẻ đại diện cho một phân công ca chạy với bố cục thông tin phân tầng trực quan:
  1. *Header thẻ:* Tuyến đường (Ga đi → Ga đến), Khoảng cách (km), và Badge trạng thái chuyến đi (`SCHEDULED`, `DEPARTED`, `COMPLETED`, `CANCELLED`).
  2. *Timeline thời gian:* Giờ xuất bến - Giờ dự kiến đến được làm nổi bật với font số lớn, kèm biểu tượng trạm dừng.
  3. *Footer phương tiện:* Biển kiểm soát (`licensePlate`), loại xe (`busType`: Giường nằm / VIP / Tiêu chuẩn) và số lượng ghế.
- **Anti-IDOR Zero-Trust Security:** API backend tự động trích xuất `req.user.userId` từ Access Token JWT. Client chỉ việc gọi `api.get('/private/driver/schedules')` mà không cần truyền bất kỳ `driverId` nào trên Query Param hay Request Body, triệt tiêu hoàn toàn rủi ro thao túng IDOR.
- **Declarative RBAC Guarding:** Tuyến đường `/driver/schedules` được bọc bên trong `<ProtectedRoute allowedRoles={['DRIVER']}>`, đảm bảo chỉ tài khoản có vai trò `DRIVER` mới có thể truy cập; mọi vai trò khác (`CUSTOMER`, `STAFF`, hoặc chưa đăng nhập) sẽ bị chặn ngay lập tức.
- **Resilient Network & Empty Feedback:** Tích hợp `useState` + `useEffect` (kèm cờ `ignore` chuẩn React 19 để tránh cascading renders), hiển thị `Loader2` khi đang nạp dữ liệu, thông báo lỗi `<Alert variant="error">` có nút "Tải lại", và màn hình trống thân thiện (`CalendarX`) khi tài xế chưa được phân công chuyến nào.

**Tech Stack:** React 19, TypeScript (~6.0, strict mode), Tailwind CSS v4 (`@tailwindcss/vite`), `axios` (v1.20), `lucide-react` (v1.59), React Router v7.

**Branch:** `feature/fe-driver-portal` (tách từ `feature/fe-admin-users`).

---

## Global Constraints

- **Pure Tailwind CSS v4:** Không cài đặt thêm bất kỳ UI library nào. Tận dụng bộ components nguyên tử sẵn có trong `src/components/ui/` (`Badge.tsx`, `Alert.tsx`, `Button.tsx`).
- **Strict Typing (TypeScript):** `strict: true`, không dùng `any`, không dùng `@ts-ignore`. Khai báo tường minh interface `DriverScheduleDto` và union type `TripStatus`.
- **Single Source of Network Truth:** Gọi API qua Axios instance `api` tại `src/lib/api.ts` (đã tiêm Bearer JWT và xử lý 401 tự động). Đường dẫn tương đối là `/private/driver/schedules`.
- **Mobile-First Touch Target:** Các nút bấm thao tác (như gọi hỗ trợ, làm mới) phải đạt kích thước tối thiểu 44x44px theo tiêu chuẩn WCAG Touch Target Size.
- **Git Flow:** Tạo branch `feature/fe-driver-portal`. Commit atomic bằng tiếng Việt theo định dạng `<type>(<scope>): <desc>`.
- **Giới hạn tệp:** Mỗi file code ≤ 150 dòng.

---

## Review Focus

1. **Anti-IDOR & Whitelist Protection:** Người dùng đăng nhập tài khoản `CUSTOMER` hoặc `ADMIN` cố tình vào URL `/driver/schedules` ➔ Bị `<ProtectedRoute>` chặn đứng ngay lập tức và chuyển hướng sang `/unauthorized`.
2. **Mobile Layout Integrity:** Mở giao diện trên kích thước màn hình điện thoại (375px - 414px) ➔ Thẻ chuyến đi hiển thị gọn gàng trong một khung nhìn, không xuất hiện thanh cuộn ngang (horizontal scrollbar), thông tin ngày giờ rõ ràng.
3. **Trip Status Badge Visuals:** Badge hiển thị đúng màu theo trạng thái chuyến xe:
   - `SCHEDULED`: Xanh dương (Đã lên lịch)
   - `DEPARTED`: Vàng hổ phách (Đang di chuyển)
   - `COMPLETED`: Xanh lục (Hoàn thành)
   - `CANCELLED`: Đỏ / Xám (Đã hủy)
4. **Empty Schedule Feedback:** Khi tài xế đăng nhập nhưng chưa có ca phân công nào trong cơ sở dữ liệu (`schedules = []`) ➔ Giao diện hiển thị icon lịch trống, thông báo *"Hiện tại bạn chưa có lịch chạy nào"* kèm nút bấm "Kiểm tra lại".
5. **Fast Refresh F5 & Network Failures:** Khi tài xế ấn F5 hoặc mạng ngắt kết nối khi đang trên đường ➔ Giao diện xử lý lỗi an toàn qua `<Alert variant="error">` kèm nút "Thử lại", không gây màn hình trắng.

---

## File Structure

```
client/
├── src/
│   ├── types/
│   │   └── driver.ts                         [CREATE NEW] — Interface DriverScheduleDto, TripStatus
│   ├── pages/
│   │   └── driver/
│   │       ├── DriverSchedulesPage.tsx       [CREATE NEW] — Mobile-First Driver Schedule Cards Page
│   │       └── components/
│   │           └── DriverTripCard.tsx        [CREATE NEW] — Single Trip Card Component
│   └── router/
│       └── index.tsx                         [MODIFY] — Đăng ký route /driver/schedules với allowedRoles=['DRIVER']
```

---

## Interfaces Produced

| Component / Type | File | Mô tả & Props chính |
|---|---|---|
| `TripStatus` | `src/types/driver.ts` | `'SCHEDULED' \| 'DEPARTED' \| 'COMPLETED' \| 'CANCELLED'` |
| `DriverScheduleDto` | `src/types/driver.ts` | Khớp 100% với DTO từ backend `vw_LichPhanCongTaiXe` |
| `DriverTripCard` | `src/pages/driver/components/DriverTripCard.tsx` | Props: `trip: DriverScheduleDto` |
| `DriverSchedulesPage` | `src/pages/driver/DriverSchedulesPage.tsx` | Container Page quản lý data fetch, filter ca chạy và refresh |

---

## Proposed Changes

### Task 0 — Git Branch Setup

> **Mục tiêu:** Tạo nhánh mới `feature/fe-driver-portal` tách từ `feature/fe-admin-users`.

**Files:** Không có (Thao tác git).

- [ ] **Step 0.1: Kiểm tra trạng thái và tạo branch `feature/fe-driver-portal`**
  ```bash
  git checkout feature/fe-admin-users
  git checkout -b feature/fe-driver-portal
  ```
  Kỳ vọng: Nhánh mới `feature/fe-driver-portal` được tạo và kích hoạt.

---

### Task 1 — Interface Definition (`src/types/driver.ts`)

> **Mục tiêu:** Định nghĩa chính xác kiểu dữ liệu DTO của lịch trình tài xế tương thích 100% với View SQL Server `vw_LichPhanCongTaiXe` và backend API.

**Files:**
- Create: `client/src/types/driver.ts`

**Interfaces:**
- `TripStatus`: `'SCHEDULED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED'`
- `DriverScheduleDto`: Toàn bộ 16 trường thông tin ca chạy.

- [ ] **Step 1.1: Tạo file `src/types/driver.ts`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  export type TripStatus = 'SCHEDULED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED'

  export interface DriverScheduleDto {
    tripId: string
    driverId: string
    userId: string
    driverName: string
    driverPhone: string
    licenseNumber: string
    departureTime: string
    arrivalTime: string
    tripStatus: TripStatus
    routeId: string
    departureStation: string
    arrivalStation: string
    distanceKm: number
    licensePlate: string
    busType: string
    totalSeats: number
  }
  ```

- [ ] **Step 1.2: Kiểm tra biên dịch TypeScript**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit`
  Expected: 0 errors.

- [ ] **Step 1.3: Commit Task 1**
  ```bash
  git add client/src/types/driver.ts
  git commit -m "feat(driver): dinh nghia kieu du lieu DriverScheduleDto cho lich tai xe"
  ```

---

### Task 2 — Implementation of `DriverTripCard.tsx` & `DriverSchedulesPage.tsx`

> **Mục tiêu:** Xây dựng giao diện Cổng thông tin Tài xế với tư duy Mobile-First, thẻ phân tầng thông tin rõ nét, hiển thị lộ trình, thời gian, biển số xe và trạng thái.

**Files:**
- Create: `client/src/pages/driver/components/DriverTripCard.tsx`
- Create: `client/src/pages/driver/DriverSchedulesPage.tsx`

**Interfaces:**
- `DriverTripCard`: Nhận prop `trip: DriverScheduleDto`.
- `DriverSchedulesPage`: Gọi `api.get('/private/driver/schedules')`, quản lý danh sách chuyến, loading, error và lọc theo ngày/trạng thái.

- [ ] **Step 2.1: Thiết kế `src/pages/driver/components/DriverTripCard.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'
  import { Bus, MapPin, Calendar, Clock, Navigation } from 'lucide-react'
  import type { DriverScheduleDto, TripStatus } from '../../../types/driver'

  export interface DriverTripCardProps {
    trip: DriverScheduleDto
  }

  export const DriverTripCard: React.FC<DriverTripCardProps> = ({ trip }) => {
    // Định dạng giờ và ngày từ ISO String
    const formatDateTime = (dateStr: string) => {
      const d = new Date(dateStr)
      const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return { time, date }
    }

    const dep = formatDateTime(trip.departureTime)
    const arr = formatDateTime(trip.arrivalTime)

    // Cấu hình Badge trạng thái chuyến đi
    const statusConfig: Record<TripStatus, { label: string; className: string }> = {
      SCHEDULED: { label: 'Đã lên lịch', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      DEPARTED: { label: 'Đang di chuyển', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      COMPLETED: { label: 'Đã hoàn thành', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200' },
    }

    const currentStatus = statusConfig[trip.tripStatus] || {
      label: trip.tripStatus,
      className: 'bg-slate-50 text-slate-700 border-slate-200'
    }

    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-shadow hover:shadow-md space-y-4">
        {/* Header Thẻ: Mã chuyến + Trạng thái */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#FF385C]">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">{trip.tripId}</span>
              <p className="text-xs text-slate-400">Tuyến #{trip.routeId}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.className}`}>
            {currentStatus.label}
          </span>
        </div>

        {/* Lộ trình & Điểm đến */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <span className="w-0.5 h-8 bg-slate-200 my-0.5" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF385C] ring-4 ring-rose-100" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400">Điểm đón</p>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{trip.departureStation}</h4>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <strong className="text-slate-800">{dep.time}</strong> — {dep.date}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">Điểm trả</p>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{trip.arrivalStation}</h4>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <strong className="text-slate-800">{arr.time}</strong> — {arr.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Thẻ: Thông tin phương tiện */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/70 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{trip.licensePlate}</span>
            <span className="text-slate-400">({trip.busType})</span>
          </div>
          <div className="text-slate-500">
            {trip.distanceKm} km • {trip.totalSeats} chỗ
          </div>
        </div>
      </div>
    )
  }

  export default DriverTripCard
  ```

- [ ] **Step 2.2: Thiết kế `src/pages/driver/DriverSchedulesPage.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React, { useEffect, useState, useCallback, useMemo } from 'react'
  import { Calendar, RefreshCw, CalendarX, Loader2, UserCheck } from 'lucide-react'
  import { AxiosError } from 'axios'
  import { useAuth } from '../../hooks/useAuth'
  import { api } from '../../lib/api'
  import type { DriverScheduleDto } from '../../types/driver'
  import type { ApiErrorResponse } from '../../types/auth'
  import { Button } from '../../components/ui/Button'
  import { Alert } from '../../components/ui/Alert'
  import { DriverTripCard } from './components/DriverTripCard'

  export const DriverSchedulesPage: React.FC = () => {
    const { user } = useAuth()
    const [schedules, setSchedules] = useState<DriverScheduleDto[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('ALL')

    // Tải dữ liệu lịch trình khi mount (kèm cleanup ignore flag)
    useEffect(() => {
      let ignore = false

      const fetchSchedules = async () => {
        try {
          const res = await api.get('/private/driver/schedules')
          if (!ignore) {
            setSchedules(res.data.data || [])
          }
        } catch (err: unknown) {
          if (!ignore) {
            if (err instanceof AxiosError && err.response?.data) {
              const apiErr = err.response.data as ApiErrorResponse
              setError(apiErr.message || 'Không thể nạp lịch phân công tài xế.')
            } else {
              setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.')
            }
          }
        } finally {
          if (!ignore) {
            setIsLoading(false)
          }
        }
      }

      void fetchSchedules()

      return () => {
        ignore = true
      }
    }, [])

    // Làm mới thủ công
    const handleRefresh = useCallback(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get('/private/driver/schedules')
        setSchedules(res.data.data || [])
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
          const apiErr = err.response.data as ApiErrorResponse
          setError(apiErr.message || 'Không thể tải lịch trình mới.')
        } else {
          setError('Lỗi kết nối mạng.')
        }
      } finally {
        setIsLoading(false)
      }
    }, [])

    // Bộ lọc trạng thái chuyến
    const filteredSchedules = useMemo(() => {
      if (filterStatus === 'ALL') return schedules
      return schedules.filter((s) => s.tripStatus === filterStatus)
    }, [schedules, filterStatus])

    return (
      <div className="min-h-screen bg-slate-50/80 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-2xl space-y-5">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Lịch trình của tôi</h1>
                <p className="text-xs text-slate-500">Tài xế: <strong className="text-slate-800">{user?.fullName || user?.userId}</strong></p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 inline-block ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">Làm mới</span>
            </Button>
          </div>

          {error && (
            <Alert variant="error" title="Lỗi hệ thống">
              {error}
            </Alert>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['ALL', 'SCHEDULED', 'DEPARTED', 'COMPLETED'].map((st) => {
              const labelMap: Record<string, string> = {
                ALL: 'Tất cả',
                SCHEDULED: 'Sắp chạy',
                DEPARTED: 'Đang chạy',
                COMPLETED: 'Đã xong',
              }
              const isActive = filterStatus === st
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {labelMap[st] || st}
                </button>
              )
            })}
          </div>

          {/* Danh sách thẻ chuyến đi */}
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Đang đồng bộ lịch trình ca chạy...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
              <CalendarX className="w-12 h-12 text-slate-300" />
              <div>
                <h4 className="text-base font-bold text-slate-800">Không có lịch chạy nào</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {filterStatus === 'ALL'
                    ? 'Hiện tại bạn chưa được phân công ca trực nào. Hãy liên hệ bộ phận điều hành nếu cần hỗ trợ.'
                    : 'Không tìm thấy chuyến đi nào ở trạng thái này.'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Kiểm tra lại
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((trip) => (
                <DriverTripCard key={trip.tripId} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  export default DriverSchedulesPage
  ```

- [ ] **Step 2.3: Kiểm tra TypeScript & ESLint cho Task 2**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: 0 errors.

- [ ] **Step 2.4: Commit Task 2**
  ```bash
  git add client/src/pages/driver/
  git commit -m "feat(driver): xay dung DriverTripCard va DriverSchedulesPage chuan mobile"
  ```

---

### Task 3 — Router Integration & Final Verification

> **Mục tiêu:** Đăng ký route `/driver/schedules` trong `src/router/index.tsx`, bọc bởi `<ProtectedRoute allowedRoles={['DRIVER']} />` để hoàn thiện 100% phạm vi công việc của Thành viên 1.

**Files:**
- Modify: `client/src/router/index.tsx`

**Interfaces:**
- Consumes: `DriverSchedulesPage` từ `src/pages/driver/DriverSchedulesPage.tsx`
- Produces: Route `/driver/schedules` RBAC Guarded.

- [ ] **Step 3.1: Cập nhật `src/router/index.tsx`**
  ```tsx
  import React from 'react'
  import { Routes, Route, Navigate } from 'react-router-dom'
  import Layout from '../components/Layout'
  import HomePage from '../pages/HomePage'
  import SearchResultsPage from '../pages/SearchResultsPage'
  import PaymentPage from '../pages/PaymentPage'
  import { LoginPage } from '../pages/LoginPage'
  import { RegisterPage } from '../pages/RegisterPage'
  import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
  import { DriverSchedulesPage } from '../pages/driver/DriverSchedulesPage'
  import { UnauthorizedPage } from '../pages/UnauthorizedPage'
  import { ProtectedRoute } from '../components/ProtectedRoute'

  export const AppRoutes: React.FC = () => {
    return (
      <Routes>
        {/* Public Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Protected Routes: Chỉ cho phép role ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Driver Protected Routes: Chỉ cho phép role DRIVER */}
          <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
            <Route path="/driver/schedules" element={<DriverSchedulesPage />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    )
  }

  export default AppRoutes
  ```

- [ ] **Step 3.2: Chạy kiểm thử TypeScript toàn Frontend**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit`
  Expected: Không có bất kỳ lỗi biên dịch nào (0 errors).

- [ ] **Step 3.3: Chạy ESLint kiểm tra quy chuẩn mã nguồn**
  Run: `cd client && npm run lint`
  Expected: 0 warnings, 0 errors.

- [ ] **Step 3.4: Commit Router Integration & Verification**
  ```bash
  git add client/src/router/index.tsx
  git commit -m "feat(router): dang ky route /driver/schedules duoc bao ve boi DRIVER role"
  ```
