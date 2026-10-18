# Frontend Authentication Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng nền tảng hạ tầng bảo mật & xác thực Frontend (Frontend Authentication Infrastructure) an toàn, phản ứng nhanh (reactive), chống flash-redirect khi F5, tự động gắn Bearer Token qua Axios Interceptors, giải mã JWT client-side bằng `jwt-decode`, quản lý trạng thái tập trung qua `AuthContext` và bảo vệ định tuyến RBAC bằng `<ProtectedRoute>` trên React 19 + React Router v7.

**Architecture:**
- **Decoupled Transport Security (Axios Interceptors):** Tách biệt hoàn toàn tầng mạng khỏi React Component Tree. Mọi request tự động tiêm `Authorization: Bearer <token>`; mọi response `401 Unauthorized` được chặn bắt tập trung, tự động xóa phiên đăng nhập lỗi thời và kích hoạt sự kiện đăng xuất toàn cục.
- **Client-Side Zero-Latency Hydration (jwt-decode):** Trạng thái `AuthContext` được khởi tạo đồng bộ ngay khi ứng dụng mount (F5) bằng cách đọc `localStorage` và giải mã claim (`userId`, `role`, `exp`) thông qua `jwt-decode`. Triệt tiêu hoàn toàn độ trễ mạng round-trip và hiện tượng nhấp nháy chuyển hướng (unauthenticated flash redirect).
- **Two-Stage Declarative Router Guarding (`ProtectedRoute`):** Kiểm duyệt 2 tầng: (1) Trạng thái khởi tạo & xác thực (`isAuthenticated`), (2) Kiểm tra thẩm quyền vai trò (`allowedRoles.includes(user.role)`). Chặn đứng `CUSTOMER` truy cập `/admin` ngay từ cấp độ định tuyến trước khi bất kỳ component nhạy cảm nào được mount.
- **Pure Tailwind CSS v4:** Không cài đặt các UI library cồng kềnh (AntD/MUI), bảo toàn bundle size siêu nhẹ và tương thích hoàn hảo với Vite 8 + React 19.

**Tech Stack:** React 19, Vite 8, TypeScript (~6.0, strict mode), Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7 (`react-router-dom`), `axios`, `jwt-decode`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`.

**Branch:** `feature/fe-core-auth` (tách từ `dev`).

---

## Global Constraints

- **Zero UI Component Libraries:** Tuyệt đối không cài Ant Design, Material UI, Chakra UI hay Bootstrap. Sử dụng 100% Tailwind CSS v4 với utility classes.
- **Strict Typing (TypeScript):** `strict: true`, không dùng `any`, không dùng `@ts-ignore`. Khai báo tường minh interface cho `AuthUser`, `DecodedToken`, `AuthContextType`.
- **Flicker-Free F5 Survival:** Phải có cờ `isInitialized: boolean` trong `AuthContext`. Tuyệt đối không chuyển hướng người dùng về `/login` khi `isInitialized === false` (đang đọc token từ `localStorage`).
- **Single Source of Network Truth:** Mọi tương tác API phải đi qua Axios instance duy nhất tại `src/lib/api.ts`. Cấm dùng `fetch` trần hoặc tạo instance Axios thứ hai.
- **Atomic State Synchronization:** Khi Token bị xóa hoặc 401 xảy ra, `localStorage` và `AuthContext` phải được đồng bộ tức thì thông qua Custom Event `auth:logout`.
- **Git Flow:** Tạo branch `feature/fe-core-auth`. Commit atomic bằng tiếng Việt theo định dạng `<type>(<scope>): <desc>`.
- Mỗi file code ≤ 150 dòng.

---

## Review Focus

1. **Chống Flash Redirect khi F5:** Người dùng đăng nhập với role `ADMIN`, đang ở `/admin/users`, ấn F5 refresh trang ➔ Hệ thống phải hiển thị trạng thái Loading/Spinner tạm thời, giải mã token hợp lệ và giữ nguyên người dùng tại `/admin/users`, tuyệt đối không đá về `/login`.
2. **Khóa quyền RBAC nghiêm ngặt:** Người dùng đăng nhập role `CUSTOMER` cố tình gõ URL `/admin` hoặc `/driver/schedules` ➔ `ProtectedRoute` lập tức chặn và điều hướng về trang `/unauthorized` (hoặc `/`), không render component của Admin.
3. **Tự động bắt lỗi 401 từ Backend:** Khi Access Token hết hạn (hoặc bị vô hiệu hóa), Backend trả về 401 ➔ Axios Response Interceptor tự động dọn dẹp `localStorage`, bắn event đăng xuất, đưa người dùng về `/login` kèm state `from: location` để đăng nhập lại.
4. **Token Malformed / Expired Check:** Nếu kẻ tấn công hoặc người dùng sửa bậy chuỗi Token trong `localStorage` thành chuỗi rác ➔ `jwt-decode` bắt ngoại lệ an toàn, xóa token hỏng và đưa app về trạng thái chưa đăng nhập mà không làm crash màn hình trắng (White Screen of Death).
5. **Preserve Redirect URL:** Khi người dùng chưa đăng nhập truy cập `/payment` ➔ Chuyển hướng sang `/login`, sau khi đăng nhập thành công phải tự động chuyển tiếp về đúng `/payment`.

---

## File Structure

```
client/
├── package.json                   [MODIFY] — Bổ sung axios, jwt-decode, zod, react-hook-form, @hookform/resolvers
├── src/
│   ├── lib/
│   │   └── api.ts                 [CREATE NEW] — Axios instance, Base URL, Request & Response Interceptors
│   ├── types/
│   │   └── auth.ts                [CREATE NEW] — UserRole, AuthUser, DecodedToken, LoginResponseDto
│   ├── contexts/
│   │   └── AuthContext.tsx        [CREATE NEW] — AuthContext, AuthProvider, hydrator, login/logout actions
│   ├── hooks/
│   │   └── useAuth.ts             [MODIFY] — Custom hook consumer useAuth với invariant assert
│   ├── components/
│   │   └── ProtectedRoute.tsx     [MODIFY] — RBAC Guard component bọc Outlet/children
│   ├── pages/
│   │   ├── LoginPage.tsx          [MODIFY] — Mock Login View với nút test Admin/Customer login
│   │   ├── AdminDashboardPage.tsx [CREATE NEW] — Dummy Admin Dashboard protected page
│   │   └── UnauthorizedPage.tsx   [CREATE NEW] — 403 Forbidden feedback page
│   ├── router/
│   │   └── index.tsx              [CREATE NEW] — Cấu hình cây định tuyến tập trung React Router v7
│   └── App.tsx                    [MODIFY] — Tích hợp AuthProvider và RouterProvider
```

---

## Interfaces Produced

| Export | Từ file | Dùng bởi |
|---|---|---|
| `api` | `src/lib/api.ts` | Toàn bộ service API calls (`auth.service.ts`, `user.service.ts`, ...) |
| `UserRole`, `AuthUser`, `DecodedToken` | `src/types/auth.ts` | `AuthContext.tsx`, `ProtectedRoute.tsx`, `api.ts` |
| `AuthContext`, `AuthProvider` | `src/contexts/AuthContext.tsx` | `App.tsx`, `src/hooks/useAuth.ts` |
| `useAuth` | `src/hooks/useAuth.ts` | `ProtectedRoute.tsx`, `LoginPage.tsx`, `Header.tsx`, ... |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | `src/router/index.tsx` |
| `AppRoutes` | `src/router/index.tsx` | `src/App.tsx` |

---

## Proposed Changes

### Task 0 — Git Branch & Dependency Installation

> **Mục tiêu:** Tạo nhánh `feature/fe-core-auth` từ `dev` và cài đặt 5 thư viện cốt lõi cho Frontend Authentication.

**Files:**
- Modify: `client/package.json`

- [ ] **Step 0.1: Checkout branch mới**
  ```bash
  git checkout dev
  git checkout -b feature/fe-core-auth
  ```
  Kỳ vọng: `Switched to a new branch 'feature/fe-core-auth'`.

- [ ] **Step 0.2: Cài đặt dependencies**
  ```bash
  cd client
  npm install axios jwt-decode zod react-hook-form @hookform/resolvers
  ```
  Kỳ vọng: `package.json` bổ sung đủ 5 thư viện; `npm audit` không có lỗi nghiêm trọng.

- [ ] **Step 0.3: Kiểm tra biên dịch**
  ```bash
  npx tsc -p tsconfig.app.json --noEmit
  ```
  Kỳ vọng: 0 errors.

- [ ] **Step 0.4: Commit**
  ```bash
  git add package.json package-lock.json
  git commit -m "chore(auth): cài đặt axios, jwt-decode, zod, react-hook-form và resolvers"
  ```

---

### Task 1 — Types & Axios Interceptors (`src/types/auth.ts` & `src/lib/api.ts`)

> **Mục tiêu:** Định nghĩa contracts dữ liệu xác thực và cấu hình Axios Instance có Request Interceptor (tiêm Bearer Token) & Response Interceptor (bắt 401/403, phát event `auth:logout`, chuẩn hóa lỗi).

**Files:**
- Create: `client/src/types/auth.ts`
- Create: `client/src/lib/api.ts`

#### Pseudo-code: `src/types/auth.ts`
```typescript
EXPORT TYPE UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'DRIVER'

EXPORT INTERFACE AuthUser {
  userId: string
  role: UserRole
  email?: string
  fullName?: string
  phone?: string
}

EXPORT INTERFACE DecodedToken {
  userId: string
  role: UserRole
  exp: number
  iat: number
}

EXPORT INTERFACE ApiErrorResponse {
  success: false
  message: string
  error?: string
  errors?: Record<string, string[]>
}
```

#### Pseudo-code: `src/lib/api.ts`
```typescript
IMPORT axios, { AxiosError, InternalAxiosRequestConfig } TỪ 'axios'
IMPORT TYPE { ApiErrorResponse } TỪ '../types/auth'

CONST API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
CONST TOKEN_STORAGE_KEY = 'auth_token'

EXPORT CONST api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Request Interceptor: Tự động tiêm Bearer Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    CONST token = localStorage.getItem(TOKEN_STORAGE_KEY)
    IF token AND config.headers:
      config.headers.Authorization = `Bearer ${token}`
    RETURN config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Xử lý 401 tập trung & đồng bộ đăng xuất
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    IF error.response:
      CONST status = error.response.status
      IF status === 401:
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        // Phát event để AuthContext tự động chuyển về null
        window.dispatchEvent(new Event('auth:logout'))
      ELSE IF status === 403:
        console.warn('[Security Guard] 403 Forbidden: Truy cập bị từ chối.')
    
    RETURN Promise.reject(error)
  }
)
```

- [ ] **Step 1.1: Tạo file `client/src/types/auth.ts`**
- [ ] **Step 1.2: Tạo file `client/src/lib/api.ts`**
- [ ] **Step 1.3: Cập nhật `client/src/services/api.ts` re-export `api` từ `src/lib/api.ts`** để giữ tương thích ngược
- [ ] **Step 1.4: Kiểm tra biên dịch**
  ```bash
  cd client && npx tsc -p tsconfig.app.json --noEmit
  ```
- [ ] **Step 1.5: Commit**
  ```bash
  git add src/types/auth.ts src/lib/api.ts src/services/api.ts
  git commit -m "feat(api): cấu hình axios instance với request/response interceptors xử lý 401"
  ```

---

### Task 2 — AuthContext, Hydration & Consumer Hook (`src/contexts/AuthContext.tsx` & `src/hooks/useAuth.ts`)

> **Mục tiêu:** Xây dựng State Management cho xác thực với cơ chế đọc token từ `localStorage` khi mount, giải mã bằng `jwt-decode`, kiểm tra hạn sử dụng `exp`, lắng nghe sự kiện `auth:logout` và cung cấp hook `useAuth()`.

**Files:**
- Create: `client/src/contexts/AuthContext.tsx`
- Modify: `client/src/hooks/useAuth.ts`

#### Pseudo-code: `src/contexts/AuthContext.tsx`
```typescript
IMPORT React, { createContext, useState, useEffect, useCallback, useMemo } TỪ 'react'
IMPORT { jwtDecode } TỪ 'jwt-decode'
IMPORT TYPE { AuthUser, DecodedToken, UserRole } TỪ '../types/auth'

EXPORT INTERFACE AuthContextType {
  user: AuthUser | null
  token: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (token: string, user?: AuthUser) => void
  logout: () => void
}

CONST TOKEN_KEY = 'auth_token'
EXPORT CONST AuthContext = createContext<AuthContextType | undefined>(undefined)

FUNCTION decodeTokenSafely(token: string): DecodedToken | null {
  TRY:
    CONST decoded = jwtDecode<DecodedToken>(token)
    // Kiểm tra exp (tính theo giây, chuyển sang milliseconds)
    IF decoded.exp * 1000 < Date.now():
      localStorage.removeItem(TOKEN_KEY)
      RETURN null
    RETURN decoded
  CATCH:
    localStorage.removeItem(TOKEN_KEY)
    RETURN null
}

EXPORT CONST AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  CONST [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  CONST [user, setUser] = useState<AuthUser | null>(null)
  CONST [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Hydrate State khi Mount (F5)
  useEffect(() => {
    CONST storedToken = localStorage.getItem(TOKEN_KEY)
    IF storedToken:
      CONST decoded = decodeTokenSafely(storedToken)
      IF decoded:
        setToken(storedToken)
        setUser({ userId: decoded.userId, role: decoded.role })
      ELSE:
        setToken(null)
        setUser(null)
    setIsInitialized(true)
  }, [])

  // Đăng nhập: Lưu token, decode và cập nhật state
  CONST login = useCallback((newToken: string, explicitUser?: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    CONST decoded = decodeTokenSafely(newToken)
    setToken(newToken)
    IF explicitUser:
      setUser(explicitUser)
    ELSE IF decoded:
      setUser({ userId: decoded.userId, role: decoded.role })
  }, [])

  // Đăng xuất: Xóa token, xóa state
  CONST logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // Lắng nghe sự kiện auth:logout từ Axios Interceptor
  useEffect(() => {
    CONST handleSyncLogout = () => logout()
    window.addEventListener('auth:logout', handleSyncLogout)
    RETURN () => window.removeEventListener('auth:logout', handleSyncLogout)
  }, [logout])

  CONST role = user?.role ?? null
  CONST isAuthenticated = Boolean(token && user)

  CONST contextValue = useMemo(() => ({
    user,
    token,
    role,
    isAuthenticated,
    isInitialized,
    login,
    logout
  }), [user, token, role, isAuthenticated, isInitialized, login, logout])

  RETURN <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
```

#### Pseudo-code: `src/hooks/useAuth.ts`
```typescript
IMPORT { useContext } TỪ 'react'
IMPORT { AuthContext, AuthContextType } TỪ '../contexts/AuthContext'

EXPORT CONST useAuth = (): AuthContextType => {
  CONST context = useContext(AuthContext)
  IF NOT context:
    THROW new Error('useAuth must be used within an AuthProvider')
  RETURN context
}
```

- [ ] **Step 2.1: Tạo file `client/src/contexts/AuthContext.tsx`**
- [ ] **Step 2.2: Cập nhật file `client/src/hooks/useAuth.ts`**
- [ ] **Step 2.3: Kiểm tra biên dịch**
  ```bash
  cd client && npx tsc -p tsconfig.app.json --noEmit
  ```
- [ ] **Step 2.4: Commit**
  ```bash
  git add src/contexts/AuthContext.tsx src/hooks/useAuth.ts
  git commit -m "feat(auth): tạo AuthProvider với f5 hydration, jwt-decode và hook useAuth"
  ```

---

### Task 3 — RBAC Router Guard (`src/components/ProtectedRoute.tsx`)

> **Mục tiêu:** Xây dựng `<ProtectedRoute>` kiểm tra 2 lớp bảo vệ: (1) `isInitialized` & `isAuthenticated`, (2) `allowedRoles`.

**Files:**
- Modify: `client/src/components/ProtectedRoute.tsx`

#### Pseudo-code: `src/components/ProtectedRoute.tsx`
```typescript
IMPORT React TỪ 'react'
IMPORT { Navigate, useLocation, Outlet } TỪ 'react-router-dom'
IMPORT { useAuth } TỪ '../hooks/useAuth'
IMPORT TYPE { UserRole } TỪ '../types/auth'

INTERFACE ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children?: React.ReactNode
}

EXPORT CONST ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  CONST { isAuthenticated, role, isInitialized } = useAuth()
  CONST location = useLocation()

  // 1. Chờ Hydration hoàn tất: Render loading spinner tạm thời để tránh flash redirect
  IF NOT isInitialized:
    RETURN (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )

  // 2. Kiểm tra Đăng nhập: Chưa đăng nhập -> Đá sang /login, ghi nhớ route ban đầu
  IF NOT isAuthenticated:
    RETURN <Navigate to="/login" state={{ from: location }} replace />

  // 3. Kiểm tra Phân quyền (RBAC): Đã đăng nhập nhưng không đủ quyền -> Chuyển sang /unauthorized
  IF allowedRoles AND allowedRoles.length > 0:
    IF NOT role OR NOT allowedRoles.includes(role):
      RETURN <Navigate to="/unauthorized" replace />

  // 4. Hợp lệ: Render Outlet (cho nested route layout) hoặc children
  RETURN children ? <>{children}</> : <Outlet />
}
```

- [ ] **Step 3.1: Viết mã hoàn chỉnh cho `client/src/components/ProtectedRoute.tsx`**
- [ ] **Step 3.2: Kiểm tra biên dịch**
  ```bash
  cd client && npx tsc -p tsconfig.app.json --noEmit
  ```
- [ ] **Step 3.3: Commit**
  ```bash
  git add src/components/ProtectedRoute.tsx
  git commit -m "feat(auth): hoàn thiện ProtectedRoute với 2 lớp guard và f5 loading state"
  ```

---

### Task 4 — Dummy Pages, Router Configuration & Integration (`src/router/index.tsx` & `src/App.tsx`)

> **Mục tiêu:** Tạo dummy pages (`LoginPage`, `AdminDashboardPage`, `UnauthorizedPage`), thiết lập cây định tuyến tập trung và gắn `AuthProvider` vào `App.tsx`.

**Files:**
- Modify: `client/src/pages/LoginPage.tsx`
- Create: `client/src/pages/AdminDashboardPage.tsx`
- Create: `client/src/pages/UnauthorizedPage.tsx`
- Create: `client/src/router/index.tsx`
- Modify: `client/src/App.tsx`

#### Pseudo-code: `src/pages/LoginPage.tsx` (Mock Security Test View)
```typescript
IMPORT React TỪ 'react'
IMPORT { useNavigate, useLocation } TỪ 'react-router-dom'
IMPORT { useAuth } TỪ '../hooks/useAuth'

EXPORT CONST LoginPage: React.FC = () => {
  CONST { login, isAuthenticated, user, logout } = useAuth()
  CONST navigate = useNavigate()
  CONST location = useLocation()
  CONST from = (location.state as { from?: Location })?.from?.pathname || '/'

  // Mock JWT tokens (chứa header.payload.signature hợp lệ để test jwtDecode)
  // Payload Admin: { userId: "USR-ADMIN-01", role: "ADMIN", exp: 4102444800 } (Year 2100)
  CONST MOCK_ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItQURNSU4tMDEiLCJyb2xlIjoiQURNSU4iLCJleHAiOjQxMDI0NDQ4MDB9.dummySignature"
  // Payload Customer: { userId: "USR-CUST-01", role: "CUSTOMER", exp: 4102444800 }
  CONST MOCK_CUST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItQ1VTVC0wMSIsInJvbGUiOiJDVVNUT01FUiIsImV4cCI6NDEwMjQ0NDgwMH0.dummySignature"

  FUNCTION handleMockLogin(token: string) {
    login(token)
    navigate(from, { replace: true })
  }

  RETURN (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Security Test Login</h2>
        {isAuthenticated ? (
          <div>
            <p className="text-emerald-600 font-medium">Đã đăng nhập: {user?.userId} ({user?.role})</p>
            <button onClick={logout} className="mt-4 w-full bg-rose-600 text-white py-2 rounded-lg">Đăng xuất</button>
          </div>
        ) : (
          <div className="space-y-3">
            <button onClick={() => handleMockLogin(MOCK_ADMIN_TOKEN)} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700">
              Đăng nhập giả lập ADMIN
            </button>
            <button onClick={() => handleMockLogin(MOCK_CUST_TOKEN)} className="w-full bg-slate-700 text-white py-2.5 rounded-lg hover:bg-slate-800">
              Đăng nhập giả lập CUSTOMER
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Pseudo-code: `src/pages/AdminDashboardPage.tsx`
```typescript
EXPORT CONST AdminDashboardPage: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900">Admin Portal Dashboard</h1>
    <p className="mt-2 text-slate-600">Trang bảo mật dành riêng cho Quản trị viên (ADMIN Role-only).</p>
  </div>
)
```

#### Pseudo-code: `src/pages/UnauthorizedPage.tsx`
```typescript
IMPORT { Link } TỪ 'react-router-dom'
EXPORT CONST UnauthorizedPage: React.FC = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <h1 className="text-6xl font-black text-rose-600">403</h1>
    <h2 className="mt-4 text-2xl font-bold text-slate-800">Truy cập bị từ chối</h2>
    <p className="mt-2 text-slate-600">Bạn không có quyền truy cập vào tài nguyên này.</p>
    <Link to="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium">Về trang chủ</Link>
  </div>
)
```

#### Pseudo-code: `src/router/index.tsx`
```typescript
IMPORT { Routes, Route, Navigate } TỪ 'react-router-dom'
IMPORT Layout TỪ '../components/Layout'
IMPORT HomePage TỪ '../pages/HomePage'
IMPORT SearchResultsPage TỪ '../pages/SearchResultsPage'
IMPORT PaymentPage TỪ '../pages/PaymentPage'
IMPORT { LoginPage } TỪ '../pages/LoginPage'
IMPORT { AdminDashboardPage } TỪ '../pages/AdminDashboardPage'
IMPORT { UnauthorizedPage } TỪ '../pages/UnauthorizedPage'
IMPORT { ProtectedRoute } TỪ '../components/ProtectedRoute'

EXPORT CONST AppRoutes = () => (
  <Routes>
    {/* Public Layout */}
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin Protected Routes: Chỉ role ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
)
```

#### Pseudo-code: `src/App.tsx`
```typescript
IMPORT React TỪ 'react'
IMPORT { BrowserRouter } TỪ 'react-router-dom'
IMPORT { AuthProvider } TỪ './contexts/AuthContext'
IMPORT { AppRoutes } TỪ './router/index'

EXPORT CONST App: React.FC = () => {
  RETURN (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
EXPORT DEFAULT App
```

- [ ] **Step 4.1: Cập nhật `src/pages/LoginPage.tsx`**
- [ ] **Step 4.2: Tạo `src/pages/AdminDashboardPage.tsx`**
- [ ] **Step 4.3: Tạo `src/pages/UnauthorizedPage.tsx`**
- [ ] **Step 4.4: Tạo `src/router/index.tsx`**
- [ ] **Step 4.5: Cập nhật `src/App.tsx`**
- [ ] **Step 4.6: Kiểm tra biên dịch**
  ```bash
  cd client && npx tsc -p tsconfig.app.json --noEmit
  ```
- [ ] **Step 4.7: Commit**
  ```bash
  git add src/pages/LoginPage.tsx src/pages/AdminDashboardPage.tsx src/pages/UnauthorizedPage.tsx src/router/index.tsx src/App.tsx
  git commit -m "feat(router): tích hợp AppRoutes với ProtectedRoute và AuthProvider"
  ```

---

## Verification Plan

### 1. Static Analysis & Type Checking
```bash
cd client && npx tsc -p tsconfig.app.json --noEmit
```
Kỳ vọng: **0 errors, 0 warnings**.

### 2. Manual E2E Scenario Verification (Dev Server)
Khởi động: `cd client && npm run dev`
1. **Scenario 1 (Chặn chưa đăng nhập):** Truy cập trực tiếp `http://localhost:5173/admin` ➔ URL tự đổi thành `/login` kèm state redirect.
2. **Scenario 2 (Đăng nhập giả lập ADMIN):** Nhấn "Đăng nhập giả lập ADMIN" tại `/login` ➔ Điều hướng thành công tới `/admin`, hiển thị "Admin Portal Dashboard".
3. **Scenario 3 (F5 Persistence Check):** Tại `/admin`, nhấn `F5` tải lại trang ➔ Thấy loading spinner chớp nhẹ, màn hình giữ nguyên ở `/admin`, không bị chuyển về `/login`.
4. **Scenario 4 (RBAC Guard Check):** Nhấn "Đăng nhập giả lập CUSTOMER", sau đó gõ URL `http://localhost:5173/admin` ➔ Lập tức bị chuyển hướng sang `/unauthorized` (Mã 403 Forbidden).
5. **Scenario 5 (Axios Bearer Injection & 401 Catch):** Kiểm tra tab Network trên DevTools, request gửi đi có `Authorization: Bearer ...`; khi server trả về 401, session tự dọn dẹp và đưa về `/login`.

---

## Dependency Graph

```
Task 0 (Checkout feature/fe-core-auth & Install axios, jwt-decode, zod, react-hook-form)
  │
  ▼
Task 1 (Data Contracts & Network Layer: types/auth.ts & lib/api.ts Interceptors)
  │
  ▼
Task 2 (State & Token Hydration Layer: AuthContext.tsx & useAuth.ts)
  │
  ▼
Task 3 (Router Perimeter Guard: components/ProtectedRoute.tsx)
  │
  ▼
Task 4 (Routing Tree & Security Integration: router/index.tsx, dummy pages, App.tsx)
```
