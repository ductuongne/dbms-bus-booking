# Core Auth UI Components & Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống UI Components nguyên tử thuần Tailwind CSS v4 (`Button`, `Input`, `Alert`) và 2 màn hình xác thực cốt lõi (`LoginPage`, `RegisterPage`) đạt chuẩn thẩm mỹ cao cấp (RedBus & Vercel design language), tích hợp hoàn hảo với `react-hook-form`, `zod`, `axios` và `AuthContext` mà không phụ thuộc vào thư viện bên ngoài (không dùng shadcn/ui hay radix-ui).

**Architecture:**
- **Atomic UI Primitives (Pure Tailwind CSS v4):** Xây dựng bộ ba UI Primitives tại `src/components/ui/` (`Button.tsx`, `Input.tsx`, `Alert.tsx`). `<Input />` được bọc bởi `React.forwardRef` để tích hợp liền mạch với cơ chế Uncontrolled Form của `react-hook-form`, hỗ trợ tự động focus khi validate thất bại, hiển thị nhãn, icon trạng thái và thông báo lỗi trực quan.
- **Zero-Rerender Form Engine (`react-hook-form` + `@hookform/resolvers/zod`):** Sử dụng `useForm` với `zodResolver` để thẩm định dữ liệu đầu vào. Tránh hiện tượng re-render toàn bộ trang khi người dùng gõ từng ký tự (O(1) render so với O(N) render của controlled state thông thường), đảm bảo trải nghiệm gõ phím mượt mà tuyệt đối 60fps.
- **RedBus & Vercel Aesthetic System:** Tận dụng bảng màu nhận diện `#FF385C` (RedBus Brand), kết hợp độ bo góc mềm mại (`rounded-xl`, `rounded-2xl`), đường viền sắc nét (`border-slate-200/80`), đổ bóng đa tầng (`shadow-sm`, `shadow-xl shadow-slate-200/50`) và hiệu ứng focus ring 2 lớp (`focus:ring-4 focus:ring-red-500/15 focus:border-red-600 outline-none`).
- **Resilient Network Handling:** Tích hợp trực tiếp với Axios instance tập trung tại `src/lib/api.ts`. Bắt trọn vẹn lỗi nghiệp vụ từ backend (400 Zod Bad Request, 401 Invalid Credentials, 409 Conflict Phone/Email) và hiển thị thông qua `<Alert variant="error" />`, đồng thời bảo toàn trạng thái chuyển hướng (`location.state.from`) sau khi đăng nhập.

**Tech Stack:** React 19, TypeScript (~6.0, strict mode), Tailwind CSS v4 (`@tailwindcss/vite`), `react-hook-form` (v7.90), `@hookform/resolvers` (v5.9), `zod` (v4.6), `axios` (v1.20), `lucide-react` (v1.59), React Router v7 (`react-router-dom`).

**Branch:** `feature/fe-auth-ui` (tách từ `feature/fe-core-auth`).

---

## Global Constraints

- **Pure Tailwind CSS v4 (Zero UI Library):** Tuyệt đối không cài đặt shadcn/ui, Radix UI, Ant Design, MUI hay Chakra UI. 100% component được dựng bằng CSS utility classes của Tailwind v4.
- **Strict Typing (TypeScript):** `strict: true`, không dùng `any`, không dùng `@ts-ignore`. Khai báo tường minh interface cho component props (`ButtonProps`, `InputProps`, `AlertProps`) và schema inference types (`LoginFormData`, `RegisterFormData`).
- **forwardRef Mandate for Form Controls:** Mọi input control bắt buộc phải bọc trong `React.forwardRef<HTMLInputElement, InputProps>` để `react-hook-form` có thể gắn `ref` DOM thật, phục vụ việc đọc giá trị native và `setFocus()` khi validation thất bại.
- **API Contract Alignment:**
  - Login: Gửi `POST /public/login` (hoặc `/public/auth/login`) với body `{ phone, password }`. Thành công trả về `{ success: true, data: { token, user } }`.
  - Register: Gửi `POST /public/register` (hoặc `/public/auth/register`) với body `{ fullName, phone, email, password }`. Thành công trả về `{ success: true, data: { userId, ... } }`.
- **Git Flow:** Tạo branch `feature/fe-auth-ui`. Commit atomic bằng tiếng Việt theo định dạng `<type>(<scope>): <desc>`.
- **Giới hạn tệp:** Mỗi file code ≤ 150 dòng. Giữ mã nguồn tinh gọn, phân tách module rõ ràng.

---

## Review Focus

1. **Accessibility & Auto-Focus:** Khi người dùng bấm "Đăng nhập" với form trống, form không được submit; focus tự động nhảy về ô input lỗi đầu tiên (SĐT) thông qua `forwardRef` mà không làm vỡ giao diện.
2. **Re-render Isolation:** Khi gõ mật khẩu vào ô Password, chỉ DOM node của input thay đổi; toàn bộ component `LoginPage` không bị re-render trên từng ký tự (kiểm chứng bằng React DevTools Profiler).
3. **Double-submit & Loading State:** Khi đang gửi request API đến server, nút bấm `Button` chuyển sang `isLoading={true}`, hiển thị spinner xoay tròn (`Loader2` từ `lucide-react`), tự động `disabled={true}` để chống submit trùng lặp.
4. **Backend Error Feedback (400/401/409):** Nhập sai mật khẩu (401) hoặc đăng ký trùng SĐT (409) ➔ `<Alert variant="error" />` hiển thị chính xác thông báo lỗi từ backend (`error.response.data.message`), không làm sập ứng dụng.
5. **Flow Redirect & State Preservation:** 
   - Đăng nhập thành công ➔ Gọi `login(token, user)` từ `useAuth()`, điều hướng về trang người dùng muốn vào trước đó (`location.state.from`) hoặc mặc định `/`.
   - Đăng ký thành công ➔ Tự động chuyển hướng về `/login` kèm thông báo thành công xanh lá (`location.state.registeredSuccess = true`) để người dùng đăng nhập ngay.

---

## File Structure

```
client/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx             [CREATE NEW] — Primary / Outline button, Loading spinner, disabled styles
│   │       ├── Input.tsx              [CREATE NEW] — forwardRef input, floating/top label, error ring & message
│   │       └── Alert.tsx              [CREATE NEW] — Status notification box (error, success, warning, info)
│   ├── pages/
│   │   ├── LoginPage.tsx              [MODIFY] — RedBus-style Login Page with RHF + Zod + Axios + useAuth
│   │   └── RegisterPage.tsx           [CREATE NEW] — RedBus-style Register Page with Password Confirm + Zod
│   └── router/
│       └── index.tsx                  [MODIFY] — Đăng ký route /register trong Public Layout
```

---

## Interfaces Produced

| Component / Type | File | Mô tả & Props chính |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | `variant: 'primary' \| 'outline'`, `isLoading?: boolean`, `size?: 'sm' \| 'md' \| 'lg'`, `ButtonHTMLAttributes` |
| `Input` | `src/components/ui/Input.tsx` | `forwardRef<HTMLInputElement>`, `label?: string`, `error?: string`, `helperText?: string`, `InputHTMLAttributes` |
| `Alert` | `src/components/ui/Alert.tsx` | `variant: 'error' \| 'success' \| 'warning' \| 'info'`, `title?: string`, `children: ReactNode` |
| `loginSchema` / `LoginFormData` | `src/pages/LoginPage.tsx` | Zod schema & type cho form Đăng nhập (`phone`, `password`) |
| `registerSchema` / `RegisterFormData` | `src/pages/RegisterPage.tsx` | Zod schema & type cho form Đăng ký (`fullName`, `phone`, `email`, `password`, `confirmPassword`) |

---

## Proposed Changes

### Task 0 — Git Branch Setup

> **Mục tiêu:** Tạo nhánh mới `feature/fe-auth-ui` tách từ nhánh hạ tầng `feature/fe-core-auth`.

**Files:** Không có (Thao tác git).

- [ ] **Step 0.1: Kiểm tra trạng thái và tạo branch `feature/fe-auth-ui`**
  ```bash
  git checkout feature/fe-core-auth
  git checkout -b feature/fe-auth-ui
  ```
  Kỳ vọng: Nhánh mới `feature/fe-auth-ui` được tạo và kích hoạt.

---

### Task 1 — Atomic UI Primitives (`Button.tsx`, `Input.tsx`, `Alert.tsx`)

> **Mục tiêu:** Xây dựng bộ ba UI Components nguyên tử trong `src/components/ui/` thuần Tailwind CSS v4, hỗ trợ `forwardRef`, accessibility, loading state và error styling sắc nét.

**Files:**
- Create: `client/src/components/ui/Button.tsx`
- Create: `client/src/components/ui/Input.tsx`
- Create: `client/src/components/ui/Alert.tsx`

**Interfaces:**
- `Button`: Nhận props kế thừa `React.ButtonHTMLAttributes<HTMLButtonElement>`, thêm `variant` ('primary' | 'outline'), `isLoading`, `fullWidth`.
- `Input`: Nhận props kế thừa `React.InputHTMLAttributes<HTMLInputElement>`, bọc trong `React.forwardRef`, thêm `label`, `error`, `helperText`.
- `Alert`: Nhận `variant` ('error' | 'success' | 'warning' | 'info'), `title`, `children`, `className`.

- [ ] **Step 1.1: Thiết kế `src/components/ui/Button.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'
  import { Loader2 } from 'lucide-react'

  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    fullWidth?: boolean
  }

  export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    disabled,
    className = '',
    ...props
  }) => {
    // 1. Base classes: tactile feedback, font styling, transitions
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 select-none active:scale-[0.98]'
    
    // 2. Variant classes (RedBus crimson red #FF385C palette)
    const variantClasses = {
      primary: 'bg-[#FF385C] hover:bg-[#E00B41] text-white shadow-sm shadow-red-500/20 focus:ring-4 focus:ring-red-500/20 focus:outline-none',
      outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs focus:ring-4 focus:ring-slate-100 focus:outline-none',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700'
    }[variant]

    // 3. Size classes
    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3.5 gap-2.5'
    }[size]

    const widthClass = fullWidth ? 'w-full' : ''

    return (
      <button
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        <span>{children}</span>
      </button>
    )
  }

  export default Button
  ```

- [ ] **Step 1.2: Thiết kế `src/components/ui/Input.tsx` với `React.forwardRef`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'
  import { AlertCircle } from 'lucide-react'

  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
  }

  export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, id, className = '', disabled, ...props }, ref) => {
      const inputId = id || props.name || Math.random().toString(36).substring(2, 9)

      // Base input: RedBus/Vercel crisp border, soft neutral text
      const baseInputClasses = 'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-all duration-150 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed'
      
      // Focus & Error states:
      const stateClasses = error
        ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/15'
        : 'border-slate-300 hover:border-slate-400 focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15'

      return (
        <div className="w-full space-y-1.5 text-left">
          {label && (
            <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {label}
            </label>
          )}
          
          <div className="relative">
            <input
              id={inputId}
              ref={ref}
              disabled={disabled}
              className={`${baseInputClasses} ${stateClasses} ${className}`}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
              {...props}
            />
            {error && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>

          {error && (
            <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 animate-in fade-in duration-150">
              {error}
            </p>
          )}

          {!error && helperText && (
            <p id={`${inputId}-desc`} className="text-xs text-slate-500">
              {helperText}
            </p>
          )}
        </div>
      )
    }
  )

  Input.displayName = 'Input'
  export default Input
  ```

- [ ] **Step 1.3: Thiết kế `src/components/ui/Alert.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'
  import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

  export interface AlertProps {
    variant?: 'error' | 'success' | 'warning' | 'info'
    title?: string
    children: React.ReactNode
    className?: string
  }

  export const Alert: React.FC<AlertProps> = ({
    variant = 'error',
    title,
    children,
    className = ''
  }) => {
    const config = {
      error: {
        container: 'bg-red-50 border-red-200 text-red-900',
        icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
      },
      success: {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      },
      warning: {
        container: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
      },
      info: {
        container: 'bg-blue-50 border-blue-200 text-blue-900',
        icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
      }
    }[variant]

    return (
      <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${config.container} ${className}`} role="alert">
        {config.icon}
        <div className="flex-1 space-y-0.5">
          {title && <h5 className="font-semibold">{title}</h5>}
          <div className="text-xs leading-relaxed">{children}</div>
        </div>
      </div>
    )
  }

  export default Alert
  ```

- [ ] **Step 1.4: Xác minh Typescript & Lint cho UI Primitives**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: Không có bất kỳ lỗi biên dịch hoặc lint nào.

- [ ] **Step 1.5: Commit UI Primitives**
  ```bash
  git add client/src/components/ui/
  git commit -m "feat(ui): khoi tao bo ba component nguyen tu Button Input va Alert"
  ```

---

### Task 2 — Implementation of `LoginPage.tsx`

> **Mục tiêu:** Cải tạo toàn diện `src/pages/LoginPage.tsx` từ mock testing view thành trang Đăng nhập sản xuất RedBus, sử dụng `useForm<LoginFormData>`, Zod validation schema, gọi `api.post('/public/login')`, xử lý `useAuth().login` và chuyển hướng mượt mà.

**Files:**
- Modify: `client/src/pages/LoginPage.tsx`

**Interfaces:**
- Consumes:
  - `Button`, `Input`, `Alert` từ `src/components/ui/`
  - `api` từ `src/lib/api.ts`
  - `useAuth` từ `src/hooks/useAuth.ts`
- Produces: Màn hình Đăng nhập RedBus `/login`.

- [ ] **Step 2.1: Thiết kế Zod Schema & Types cho Đăng nhập**
  ```tsx
  import { z } from 'zod'

  export const loginSchema = z.object({
    phone: z
      .string()
      .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu'),
  })

  export type LoginFormData = z.infer<typeof loginSchema>
  ```

- [ ] **Step 2.2: Thiết kế Component Logic & Form Wiring (`LoginPage.tsx`)**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React, { useState } from 'react'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { useNavigate, useLocation, Link } from 'react-router-dom'
  import { AxiosError } from 'axios'
  import { Bus, Lock, Phone } from 'lucide-react'
  import { useAuth } from '../hooks/useAuth'
  import { api } from '../lib/api'
  import type { ApiErrorResponse } from '../types/auth'
  import { Button } from '../components/ui/Button'
  import { Input } from '../components/ui/Input'
  import { Alert } from '../components/ui/Alert'
  import { loginSchema, type LoginFormData } from './LoginPage.schema' // hoặc inline schema

  export const LoginPage: React.FC = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [serverError, setServerError] = useState<string | null>(null)

    // Lấy thông báo đăng ký thành công từ state điều hướng (nếu có)
    const locationState = location.state as { from?: { pathname: string }; registeredSuccess?: boolean } | null
    const registeredSuccess = locationState?.registeredSuccess
    const redirectUrl = locationState?.from?.pathname || '/'

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
      mode: 'onTouched', // Validation kích hoạt khi blur ra khỏi field
      defaultValues: {
        phone: '',
        password: '',
      },
    })

    const onSubmit = async (data: LoginFormData) => {
      try {
        setServerError(null)
        // Gọi backend API đăng nhập (hỗ trợ endpoint public)
        const response = await api.post('/public/login', data)
        const { token, user } = response.data.data

        // Lưu phiên đăng nhập vào Context & localStorage
        login(token, user)

        // Chuyển hướng người dùng về trang trước đó hoặc trang chủ
        navigate(redirectUrl, { replace: true })
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
          const apiErr = err.response.data as ApiErrorResponse
          setServerError(apiErr.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.')
        } else {
          setServerError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
        }
      }
    }

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Header Card với Logo RedBus */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-[#FF385C] items-center justify-center text-white shadow-md shadow-red-500/30">
              <Bus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập tài khoản</h1>
            <p className="text-sm text-slate-500">Đặt vé xe nhanh chóng và quản lý hành trình dễ dàng</p>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            {registeredSuccess && (
              <div className="mb-5">
                <Alert variant="success" title="Đăng ký thành công">
                  Tài khoản của bạn đã sẵn sàng. Vui lòng đăng nhập để tiếp tục!
                </Alert>
              </div>
            )}

            {serverError && (
              <div className="mb-5">
                <Alert variant="error" title="Đăng nhập thất bại">
                  {serverError}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0912345678"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <div className="pt-2">
                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  Đăng nhập
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-[#FF385C] hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default LoginPage
  ```

- [ ] **Step 2.3: Kiểm tra biên dịch & lint của `LoginPage.tsx`**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: 0 errors.

- [ ] **Step 2.4: Commit `LoginPage.tsx`**
  ```bash
  git add client/src/pages/LoginPage.tsx
  git commit -m "feat(auth): hoan thien giao dien va xu ly dang nhap voi RHF va Zod"
  ```

---

### Task 3 — Implementation of `RegisterPage.tsx`

> **Mục tiêu:** Tạo mới màn hình Đăng ký tài khoản `src/pages/RegisterPage.tsx` chuẩn RedBus, form gồm Họ tên, Số điện thoại, Email, Mật khẩu, Xác nhận mật khẩu, kiểm tra trùng khớp mật khẩu qua Zod `.refine()`, gọi `POST /public/register` và điều hướng về `/login` với thông báo thành công.

**Files:**
- Create: `client/src/pages/RegisterPage.tsx`

**Interfaces:**
- Consumes:
  - `Button`, `Input`, `Alert` từ `src/components/ui/`
  - `api` từ `src/lib/api.ts`
- Produces: Màn hình Đăng ký RedBus `/register`.

- [ ] **Step 3.1: Thiết kế Zod Schema cho Đăng ký**
  ```tsx
  import { z } from 'zod'

  export const registerSchema = z
    .object({
      fullName: z
        .string()
        .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
        .max(100, 'Họ và tên không được vượt quá 100 ký tự')
        .trim(),
      phone: z
        .string()
        .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'),
      email: z
        .string()
        .email('Địa chỉ email không đúng định dạng')
        .toLowerCase()
        .trim(),
      password: z
        .string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
      confirmPassword: z
        .string()
        .min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Mật khẩu xác nhận không khớp',
      path: ['confirmPassword'],
    })

  export type RegisterFormData = z.infer<typeof registerSchema>
  ```

- [ ] **Step 3.2: Thiết kế Component Logic & Form Wiring (`RegisterPage.tsx`)**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React, { useState } from 'react'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { useNavigate, Link } from 'react-router-dom'
  import { AxiosError } from 'axios'
  import { Bus } from 'lucide-react'
  import { api } from '../lib/api'
  import type { ApiErrorResponse } from '../types/auth'
  import { Button } from '../components/ui/Button'
  import { Input } from '../components/ui/Input'
  import { Alert } from '../components/ui/Alert'
  import { registerSchema, type RegisterFormData } from './RegisterPage.schema' // hoặc inline

  export const RegisterPage: React.FC = () => {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState<string | null>(null)

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      mode: 'onTouched',
      defaultValues: {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
    })

    const onSubmit = async (data: RegisterFormData) => {
      try {
        setServerError(null)
        // Gọi API backend đăng ký tài khoản
        await api.post('/public/register', {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          password: data.password,
        })

        // Thành công: Chuyển hướng sang /login với state báo thành công
        navigate('/login', {
          replace: true,
          state: { registeredSuccess: true },
        })
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
          const apiErr = err.response.data as ApiErrorResponse
          setServerError(apiErr.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.')
        } else {
          setServerError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
        }
      }
    }

    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-[#FF385C] items-center justify-center text-white shadow-md shadow-red-500/30">
              <Bus className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tạo tài khoản mới</h1>
            <p className="text-sm text-slate-500">Đăng ký để tích điểm thành viên và nhận ưu đãi chuyến đi</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
            {serverError && (
              <div className="mb-5">
                <Alert variant="error" title="Đăng ký thất bại">
                  {serverError}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="0912345678"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="nguyenvana@gmail.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Tối thiểu 8 ký tự"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="Nhập lại mật khẩu"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <div className="pt-2">
                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  Đăng ký tài khoản
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-[#FF385C] hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default RegisterPage
  ```

- [ ] **Step 3.3: Kiểm tra biên dịch & lint của `RegisterPage.tsx`**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: 0 errors.

- [ ] **Step 3.4: Commit `RegisterPage.tsx`**
  ```bash
  git add client/src/pages/RegisterPage.tsx
  git commit -m "feat(auth): khoi tao trang dang ky RegisterPage voi Zod validation"
  ```

---

### Task 4 — Router Integration & Final Verification

> **Mục tiêu:** Cập nhật `src/router/index.tsx` để tích hợp route `/register` vào Public Layout, kiểm tra toàn bộ luồng điều hướng và chạy kiểm thử tĩnh toàn dự án.

**Files:**
- Modify: `client/src/router/index.tsx`

**Interfaces:**
- Consumes: `RegisterPage` từ `src/pages/RegisterPage.tsx`
- Produces: Cập nhật route tree React Router v7.

- [ ] **Step 4.1: Cập nhật `src/router/index.tsx`**
  ```tsx
  import React from 'react'
  import { Routes, Route, Navigate } from 'react-router-dom'
  import Layout from '../components/Layout'
  import HomePage from '../pages/HomePage'
  import SearchResultsPage from '../pages/SearchResultsPage'
  import PaymentPage from '../pages/PaymentPage'
  import { LoginPage } from '../pages/LoginPage'
  import { RegisterPage } from '../pages/RegisterPage'
  import { AdminDashboardPage } from '../pages/AdminDashboardPage'
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

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    )
  }

  export default AppRoutes
  ```

- [ ] **Step 4.2: Chạy kiểm thử TypeScript toàn Frontend**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit`
  Expected: Không có bất kỳ lỗi biên dịch nào.

- [ ] **Step 4.3: Chạy ESLint kiểm tra code style**
  Run: `cd client && npm run lint`
  Expected: 0 warnings, 0 errors.

- [ ] **Step 4.4: Commit Router Integration**
  ```bash
  git add client/src/router/index.tsx
  git commit -m "feat(router): dang ky route /register vao public layout"
  ```
