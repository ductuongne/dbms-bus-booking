# Admin User Management Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng giao diện bảng điều khiển quản trị người dùng (Admin User Management Dashboard) chuẩn enterprise, tiêu thụ toàn bộ RESTful API backend (`/api/private/admin/users`), hỗ trợ hiển thị danh sách người dùng với phân loại Role/Trạng thái, tạo mới, chỉnh sửa thông tin và khóa/mở khóa tài khoản (Soft-Delete) với kỹ thuật Cập nhật Lạc quan (Optimistic UI Update) thuần Tailwind CSS v4.

**Architecture:**
- **Smart/Dumb Component Decomposition:**
  - `<AdminDashboardPage />` đóng vai trò Smart Container Component: quản lý vòng đời dữ liệu (data fetching qua Axios + JWT), quản lý state danh sách người dùng, error/loading state, modal lifecycle và các hàm xử lý mutation (Create, Update, Toggle Status).
  - `<UserTable />` là Dumb/Presentational Component: chỉ nhận props `users`, `isLoading`, `onEdit`, `onToggleStatus` để hiển thị dữ liệu bảng, tách biệt hoàn toàn khỏi logic mạng.
  - `<UserFormModal />` là Form Modal biệt lập: bọc `react-hook-form` + `zodResolver` xử lý Create/Update mode linh hoạt mà không làm re-render toàn bộ bảng người dùng.
- **Pure Tailwind CSS v4 Primitives (`src/components/ui/`):** Xây dựng bộ ba UI Primitives nguyên tử tái sử dụng cao:
  - `Table.tsx`: Bộ components `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` hỗ trợ hover, border mềm, responsive scroll.
  - `Badge.tsx`: Pill badge hỗ trợ các biến thể Role (`ADMIN`, `STAFF`, `DRIVER`, `CUSTOMER`) và Trạng thái (`active`, `inactive/locked`).
  - `Modal.tsx`: Dialog modal chuẩn tiếp cận với Backdrop blur, phím `Escape`, click outside, tiêu đề và các nút thao tác.
- **Optimistic UI Status Mutation (Soft-Delete):** Khi Admin nhấn Khóa/Mở khóa tài khoản, trạng thái `isActive` trong local state của React được đảo chiều ngay lập tức (0ms latency), trong khi lệnh `PATCH /api/private/admin/users/:id/status` chạy ngầm. Nếu request thất bại, hệ thống tự động hoàn tác (rollback) trạng thái cũ và hiển thị thông báo lỗi.
- **RBAC Perimeter Integration:** Định tuyến được bảo vệ bởi `<ProtectedRoute allowedRoles={['ADMIN']}>`, tự động chặn và đá các tài khoản không có quyền sang `/unauthorized` hoặc `/login`.

**Tech Stack:** React 19, TypeScript (~6.0, strict mode), Tailwind CSS v4 (`@tailwindcss/vite`), `react-hook-form` (v7.90), `@hookform/resolvers` (v5.9), `zod` (v4.6), `axios` (v1.20), `lucide-react` (v1.59), React Router v7.

**Branch:** `feature/fe-admin-users` (tách từ `feature/fe-auth-ui`).

---

## Global Constraints

- **Pure Tailwind CSS v4 (Zero External UI Library):** Tuyệt đối không cài shadcn/ui, Radix UI, Ant Design hay MUI. Mọi component Table, Badge, Modal được viết thuần CSS utility classes.
- **Strict Typing (TypeScript):** `strict: true`, không dùng `any`, không dùng `@ts-ignore`. Khai báo kiểu dữ liệu tường minh `AdminUser`, `CreateUserFormData`, `UpdateUserFormData`.
- **Single Source of Network Truth:** Mọi tương tác API đều thông qua Axios instance `api` tại `src/lib/api.ts` (đã cấu hình Bearer Token injection và 401 Interceptor). Base URL là `http://localhost:5000/api`, do đó các đường dẫn API tương đối là `/private/admin/users`.
- **Self-Lock Prevention UI:** Không cho phép Admin tự bấm Khóa tài khoản của chính mình (ẩn hoặc disable nút Khóa với dòng tương ứng dựa vào `user.userId === currentAdmin.userId`).
- **Git Flow:** Tạo branch `feature/fe-admin-users`. Commit atomic bằng tiếng Việt theo định dạng `<type>(<scope>): <desc>`.
- **Giới hạn tệp:** Mỗi file code ≤ 150 dòng. Tách nhỏ logic thành các sub-component khi cần thiết.

---

## Review Focus

1. **Optimistic UI & Rollback:** Bấm nút Khóa/Mở khóa trên một user ➔ Icon và Badge trạng thái đổi ngay lập tức; ngắt kết nối mạng hoặc server trả lỗi ➔ Badge lập tức rollback về trạng thái ban đầu và `<Alert variant="error">` hiển thị thông báo lỗi.
2. **Self-Lock Prevention:** Tại dòng của Admin đang đăng nhập, nút "Khóa tài khoản" bị vô hiệu hóa hoặc ẩn đi kèm tooltip/badge "Tài khoản hiện tại", ngăn chặn lỗi 400 từ server.
3. **Form Mode Switching (Create vs Edit):** 
   - Nhấn "Thêm người dùng": Modal mở ra với form trống, trường Mật khẩu bắt buộc nhập (tối thiểu 8 ký tự).
   - Nhấn "Chỉnh sửa": Modal mở ra điền sẵn thông tin người dùng, trường Mật khẩu được ẩn đi (vì API `PUT /users/:id` không cập nhật mật khẩu).
4. **Empty & Loading States:** Khi đang tải dữ liệu từ server, hiển thị skeleton rows hoặc spinner; khi danh sách người dùng trống, hiển thị Empty State sạch sẽ có nút bấm kích hoạt tạo người dùng đầu tiên.
5. **RBAC Guard Enforcement:** Khách hàng (CUSTOMER) hoặc Khách vãng lai cố tình truy cập trực tiếp URL `/admin` ➔ Bị chặn ngay lập tức và chuyển hướng sang `/unauthorized`.

---

## File Structure

```
client/
├── src/
│   ├── types/
│   │   └── admin.ts                       [CREATE NEW] — AdminUser interface, UserRole, UserFormValues
│   ├── components/
│   │   └── ui/
│   │       ├── Table.tsx                  [CREATE NEW] — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
│   │       ├── Badge.tsx                  [CREATE NEW] — Pill badges for Roles & Statuses
│   │       └── Modal.tsx                  [CREATE NEW] — Accessible Dialog modal with Backdrop & ESC listener
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx     [CREATE/REPLACE] — Main Admin Container Page
│   │       └── components/
│   │           ├── UserTable.tsx          [CREATE NEW] — Presentational Table with Actions
│   │           └── UserFormModal.tsx      [CREATE NEW] — Modal Form for Create/Edit User (RHF + Zod)
│   └── router/
│       └── index.tsx                      [MODIFY] — Trỏ route /admin vào src/pages/admin/AdminDashboardPage.tsx
```

---

## Interfaces Produced

| Component / Type | File | Mô tả & Props chính |
|---|---|---|
| `AdminUser` | `src/types/admin.ts` | `{ userId, fullName, email, phone, role, loyaltyPoints, isActive }` |
| `Table`, `TableRow`, ... | `src/components/ui/Table.tsx` | Pure Tailwind table primitives với border, padding và hover states |
| `Badge` | `src/components/ui/Badge.tsx` | `variant: 'role' \| 'status'`, `role?: UserRole`, `isActive?: boolean`, `children: ReactNode` |
| `Modal` | `src/components/ui/Modal.tsx` | `isOpen: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode` |
| `UserTable` | `src/pages/admin/components/UserTable.tsx` | `users: AdminUser[]`, `isLoading: boolean`, `onEdit: (u) => void`, `onToggleStatus: (u) => void`, `currentUserId?: string` |
| `UserFormModal` | `src/pages/admin/components/UserFormModal.tsx` | `isOpen: boolean`, `onClose: () => void`, `onSubmit: (data) => Promise<void>`, `userToEdit?: AdminUser \| null`, `isLoading: boolean` |
| `AdminDashboardPage` | `src/pages/admin/AdminDashboardPage.tsx` | Container Page quản lý dữ liệu, search, pagination và mutations |

---

## Proposed Changes

### Task 0 — Git Branch Setup

> **Mục tiêu:** Tạo nhánh mới `feature/fe-admin-users` tách từ `feature/fe-auth-ui`.

**Files:** Không có (Thao tác git).

- [ ] **Step 0.1: Kiểm tra trạng thái và tạo branch `feature/fe-admin-users`**
  ```bash
  git checkout feature/fe-auth-ui
  git checkout -b feature/fe-admin-users
  ```
  Kỳ vọng: Nhánh mới `feature/fe-admin-users` được tạo và kích hoạt.

---

### Task 1 — Reusable UI Primitives (`Table.tsx`, `Badge.tsx`, `Modal.tsx`)

> **Mục tiêu:** Xây dựng bộ ba UI Primitives thuần Tailwind CSS v4 trong `src/components/ui/` để phục vụ bảng quản trị và modal tương tác.

**Files:**
- Create: `client/src/types/admin.ts`
- Create: `client/src/components/ui/Table.tsx`
- Create: `client/src/components/ui/Badge.tsx`
- Create: `client/src/components/ui/Modal.tsx`

**Interfaces:**
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`: Kế thừa các thuộc tính HTML table tương ứng.
- `Badge`: Props gồm `variant: 'role' | 'status'`, `role?: UserRole`, `isActive?: boolean`, `className?: string`.
- `Modal`: Props gồm `isOpen: boolean`, `onClose: () => void`, `title: string`, `children: React.ReactNode`, `maxWidth?: 'sm' | 'md' | 'lg' | 'xl'`.

- [ ] **Step 1.1: Định nghĩa Types trong `src/types/admin.ts`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import type { UserRole } from './auth'

  export interface AdminUser {
    userId: string
    fullName: string
    email: string
    phone: string
    role: UserRole
    loyaltyPoints: number
    isActive: boolean
  }

  export interface CreateUserInput {
    fullName: string
    email: string
    phone: string
    password: string
    role: UserRole
  }

  export interface UpdateUserInput {
    fullName: string
    email: string
    phone: string
    role: UserRole
  }
  ```

- [ ] **Step 1.2: Thiết kế `src/components/ui/Table.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'

  export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className={`w-full text-left text-sm text-slate-700 ${className}`} {...props} />
    </div>
  )

  export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
    <thead className={`border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`} {...props} />
  )

  export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
    <tbody className={`divide-y divide-slate-100 ${className}`} {...props} />
  )

  export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...props }) => (
    <tr className={`transition-colors hover:bg-slate-50/70 ${className}`} {...props} />
  )

  export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
    <th className={`px-4 py-3.5 font-semibold text-slate-700 ${className}`} {...props} />
  )

  export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
    <td className={`px-4 py-3.5 align-middle ${className}`} {...props} />
  )
  ```

- [ ] **Step 1.3: Thiết kế `src/components/ui/Badge.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'
  import type { UserRole } from '../../types/auth'

  export interface BadgeProps {
    variant?: 'role' | 'status' | 'default'
    role?: UserRole
    isActive?: boolean
    children?: React.ReactNode
    className?: string
  }

  export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    role,
    isActive,
    children,
    className = ''
  }) => {
    let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200'

    if (variant === 'role' && role) {
      colorClasses = {
        ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
        STAFF: 'bg-blue-50 text-blue-700 border-blue-200',
        DRIVER: 'bg-amber-50 text-amber-700 border-amber-200',
        CUSTOMER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }[role]
    } else if (variant === 'status' && typeof isActive === 'boolean') {
      colorClasses = isActive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-rose-50 text-rose-700 border-rose-200'
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}>
        {variant === 'status' && (
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        )}
        <span>{children || (variant === 'status' ? (isActive ? 'Hoạt động' : 'Đã khóa') : role)}</span>
      </span>
    )
  }

  export default Badge
  ```

- [ ] **Step 1.4: Thiết kế `src/components/ui/Modal.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React, { useEffect } from 'react'
  import { X } from 'lucide-react'

  export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: React.ReactNode
    maxWidth?: 'sm' | 'md' | 'lg'
  }

  export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'md'
  }) => {
    // Đóng modal khi nhấn Escape
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) onClose()
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const maxWidthClass = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg'
    }[maxWidth]

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
          onClick={onClose} 
          aria-hidden="true" 
        />

        {/* Modal content surface */}
        <div className={`relative w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 transition-all z-10 space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2">{children}</div>
        </div>
      </div>
    )
  }

  export default Modal
  ```

- [ ] **Step 1.5: Kiểm tra TypeScript & Lint cho Task 1**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: 0 errors.

- [ ] **Step 1.6: Commit Task 1**
  ```bash
  git add client/src/types/admin.ts client/src/components/ui/Table.tsx client/src/components/ui/Badge.tsx client/src/components/ui/Modal.tsx
  git commit -m "feat(ui): khoi tao cac component Table Badge Modal va kieu du lieu AdminUser"
  ```

---

### Task 2 — Implementation of `UserTable.tsx` & `UserFormModal.tsx`

> **Mục tiêu:** Xây dựng hai component chuyên trách tại `src/pages/admin/components/`: Bảng dữ liệu người dùng (`UserTable`) và Modal điền form thêm/sửa (`UserFormModal`).

**Files:**
- Create: `client/src/pages/admin/components/UserTable.tsx`
- Create: `client/src/pages/admin/components/UserFormModal.tsx`

**Interfaces:**
- `UserTable`:
  - Consumes: `AdminUser` từ `src/types/admin.ts`, `Table`, `Badge`, `Button` từ `src/components/ui/`
  - Props: `users: AdminUser[]`, `isLoading: boolean`, `onEdit: (u: AdminUser) => void`, `onToggleStatus: (u: AdminUser) => void`, `currentUserId?: string`
- `UserFormModal`:
  - Consumes: `Modal`, `Input`, `Button`, `Alert` từ `src/components/ui/`, `react-hook-form`, `zod`
  - Props: `isOpen: boolean`, `onClose: () => void`, `onSubmit: (data: any) => Promise<void>`, `userToEdit?: AdminUser | null`, `isLoading: boolean`

- [ ] **Step 2.1: Thiết kế `src/pages/admin/components/UserTable.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React from 'react'
  import { Edit2, Lock, Unlock, Loader2, UserX } from 'lucide-react'
  import type { AdminUser } from '../../../types/admin'
  import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table'
  import { Badge } from '../../../components/ui/Badge'
  import { Button } from '../../../components/ui/Button'

  export interface UserTableProps {
    users: AdminUser[]
    isLoading: boolean
    onEdit: (user: AdminUser) => void
    onToggleStatus: (user: AdminUser) => void
    currentUserId?: string
  }

  export const UserTable: React.FC<UserTableProps> = ({
    users,
    isLoading,
    onEdit,
    onToggleStatus,
    currentUserId
  }) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
          <p className="mt-3 text-sm font-medium text-slate-500">Đang tải danh sách người dùng...</p>
        </div>
      )
    }

    if (users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <UserX className="w-12 h-12 text-slate-300" />
          <h4 className="mt-3 text-base font-bold text-slate-800">Không tìm thấy người dùng</h4>
          <p className="text-xs text-slate-500 mt-1">Chưa có người dùng nào hoặc từ khóa tìm kiếm không khớp.</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã NV/User</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Thông tin liên hệ</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Điểm TL</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.userId === currentUserId
            return (
              <TableRow key={user.userId}>
                <TableCell className="font-mono text-xs font-bold text-slate-600">{user.userId}</TableCell>
                <TableCell className="font-semibold text-slate-900">{user.fullName}</TableCell>
                <TableCell>
                  <div className="text-xs space-y-0.5">
                    <p className="text-slate-800">{user.phone}</p>
                    <p className="text-slate-400">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="role" role={user.role} />
                </TableCell>
                <TableCell className="font-semibold text-slate-700">{user.loyaltyPoints}</TableCell>
                <TableCell>
                  <Badge variant="status" isActive={user.isActive} />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={user.isActive ? 'outline' : 'primary'}
                    size="sm"
                    disabled={isSelf}
                    onClick={() => onToggleStatus(user)}
                    title={isSelf ? 'Không thể tự khóa tài khoản của chính mình' : user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    className={user.isActive ? 'hover:border-rose-300 hover:text-rose-600' : ''}
                  >
                    {user.isActive ? <Lock className="w-3.5 h-3.5 text-rose-500" /> : <Unlock className="w-3.5 h-3.5" />}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  export default UserTable
  ```

- [ ] **Step 2.2: Thiết kế `src/pages/admin/components/UserFormModal.tsx`**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React, { useEffect, useState } from 'react'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { z } from 'zod'
  import type { AdminUser, CreateUserInput, UpdateUserInput } from '../../../types/admin'
  import { Modal } from '../../../components/ui/Modal'
  import { Input } from '../../../components/ui/Input'
  import { Button } from '../../../components/ui/Button'
  import { Alert } from '../../../components/ui/Alert'

  const userFormSchema = z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100).trim(),
    email: z.string().email('Email không đúng định dạng').trim(),
    phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại di động VN 10 chữ số'),
    role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN', 'DRIVER']),
    password: z.string().optional(),
  })

  type UserFormValues = z.infer<typeof userFormSchema>

  export interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (values: CreateUserInput | UpdateUserInput) => Promise<void>
    userToEdit?: AdminUser | null
    isLoading: boolean
  }

  export const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    userToEdit,
    isLoading
  }) => {
    const isEditMode = Boolean(userToEdit)
    const [formError, setFormError] = useState<string | null>(null)

    const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors }
    } = useForm<UserFormValues>({
      resolver: zodResolver(userFormSchema),
      defaultValues: {
        fullName: '',
        email: '',
        phone: '',
        role: 'CUSTOMER',
        password: '',
      }
    })

    // Đồng bộ giá trị form khi mở modal hoặc đổi userToEdit
    useEffect(() => {
      if (userToEdit) {
        reset({
          fullName: userToEdit.fullName,
          email: userToEdit.email,
          phone: userToEdit.phone,
          role: userToEdit.role,
          password: '',
        })
      } else {
        reset({
          fullName: '',
          email: '',
          phone: '',
          role: 'CUSTOMER',
          password: '',
        })
      }
      setFormError(null)
    }, [userToEdit, isOpen, reset])

    const handleFormSubmit = async (data: UserFormValues) => {
      if (!isEditMode && (!data.password || data.password.length < 8)) {
        setError('password', { message: 'Mật khẩu phải có ít nhất 8 ký tự khi tạo mới' })
        return
      }

      try {
        setFormError(null)
        await onSubmit(data as CreateUserInput | UpdateUserInput)
        onClose()
      } catch (err: any) {
        setFormError(err.message || 'Thao tác không thành công')
      }
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        description={isEditMode ? `Cập nhật thông tin cho mã ${userToEdit?.userId}` : 'Khởi tạo tài khoản nhân sự hoặc khách hàng'}
      >
        {formError && (
          <div className="mb-4">
            <Alert variant="error">{formError}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
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
            label="Địa chỉ Email"
            type="email"
            placeholder="user@redbus.vn"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Vai trò (Role)
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15 outline-none"
              {...register('role')}
            >
              <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
              <option value="STAFF">STAFF (Nhân viên phòng vé)</option>
              <option value="DRIVER">DRIVER (Tài xế lái xe)</option>
              <option value="ADMIN">ADMIN (Quản trị viên)</option>
            </select>
          </div>

          {!isEditMode && (
            <Input
              label="Mật khẩu ban đầu"
              type="password"
              placeholder="Tối thiểu 8 ký tự"
              error={errors.password?.message}
              {...register('password')}
            />
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEditMode ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </Modal>
    )
  }

  export default UserFormModal
  ```

- [ ] **Step 2.3: Kiểm tra TypeScript & Lint cho Task 2**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: 0 errors.

- [ ] **Step 2.4: Commit Task 2**
  ```bash
  git add client/src/pages/admin/components/UserTable.tsx client/src/pages/admin/components/UserFormModal.tsx
  git commit -m "feat(admin): hoan thien UserTable va UserFormModal voi RHF va Zod"
  ```

---

### Task 3 — Implementation of `AdminDashboardPage.tsx`

> **Mục tiêu:** Xây dựng trang Container `src/pages/admin/AdminDashboardPage.tsx` tích hợp gọi API qua Axios (`/private/admin/users`), hỗ trợ tìm kiếm theo tên/SĐT/email, lọc theo vai trò, thêm/sửa người dùng và xử lý Cập nhật Lạc quan (Optimistic UI) khi khóa tài khoản.

**Files:**
- Create: `client/src/pages/admin/AdminDashboardPage.tsx`

**Interfaces:**
- Consumes:
  - `api` từ `src/lib/api.ts`
  - `useAuth` từ `src/hooks/useAuth.ts`
  - `UserTable`, `UserFormModal` từ `./components/`
  - `Button`, `Alert`, `Input` từ `src/components/ui/`
- Produces: Màn hình quản trị người dùng `/admin`.

- [ ] **Step 3.1: Thiết kế Component Logic & Data Flow (`AdminDashboardPage.tsx`)**
  - **Pseudo-code & Architectural Structure:**
  ```tsx
  import React, { useEffect, useState, useMemo, useCallback } from 'react'
  import { Plus, Search, RefreshCw, Users, ShieldAlert } from 'lucide-react'
  import { AxiosError } from 'axios'
  import { useAuth } from '../../hooks/useAuth'
  import { api } from '../../lib/api'
  import type { AdminUser, CreateUserInput, UpdateUserInput } from '../../types/admin'
  import type { ApiErrorResponse } from '../../types/auth'
  import { Button } from '../../components/ui/Button'
  import { Alert } from '../../components/ui/Alert'
  import { UserTable } from './components/UserTable'
  import { UserFormModal } from './components/UserFormModal'

  export const AdminDashboardPage: React.FC = () => {
    const { user: currentAdmin } = useAuth()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [globalError, setGlobalError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<string>('ALL')

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // 1. Fetch Users List
    const fetchUsers = useCallback(async () => {
      try {
        setIsLoading(true)
        setGlobalError(null)
        const response = await api.get('/private/admin/users')
        setUsers(response.data.data || [])
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.data) {
          const apiErr = err.response.data as ApiErrorResponse
          setGlobalError(apiErr.message || 'Không thể tải danh sách người dùng.')
        } else {
          setGlobalError('Lỗi kết nối máy chủ. Vui lòng thử lại.')
        }
      } finally {
        setIsLoading(false)
      }
    }, [])

    useEffect(() => {
      fetchUsers()
    }, [fetchUsers])

    // 2. Optimistic UI Toggle Status (Soft-Delete)
    const handleToggleStatus = async (targetUser: AdminUser) => {
      const originalStatus = targetUser.isActive
      const newStatus = !originalStatus

      // Optimistic update in-place
      setUsers((prev) =>
        prev.map((u) => (u.userId === targetUser.userId ? { ...u, isActive: newStatus } : u))
      )

      try {
        await api.patch(`/private/admin/users/${targetUser.userId}/status`, { isActive: newStatus })
      } catch (err: unknown) {
        // Rollback on failure
        setUsers((prev) =>
          prev.map((u) => (u.userId === targetUser.userId ? { ...u, isActive: originalStatus } : u))
        )
        const msg = (err instanceof AxiosError && err.response?.data?.message) || 'Không thể thay đổi trạng thái người dùng.'
        setGlobalError(msg)
      }
    }

    // 3. Create or Update User Mutation
    const handleFormSubmit = async (formData: CreateUserInput | UpdateUserInput) => {
      setIsSubmitting(true)
      try {
        if (userToEdit) {
          // Update
          const res = await api.put(`/private/admin/users/${userToEdit.userId}`, formData)
          const updated = res.data.data
          setUsers((prev) => prev.map((u) => (u.userId === updated.userId ? updated : u)))
        } else {
          // Create
          const res = await api.post('/private/admin/users', formData)
          const created = res.data.data
          setUsers((prev) => [created, ...prev])
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    // 4. Client-side Search & Role Filter
    const filteredUsers = useMemo(() => {
      return users.filter((u) => {
        const matchesRole = selectedRole === 'ALL' || u.role === selectedRole
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
          !q ||
          u.fullName.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.userId.toLowerCase().includes(q)
        return matchesRole && matchesSearch
      })
    }, [users, selectedRole, searchQuery])

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-[#FF385C]" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý người dùng</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Quản lý tài khoản nội bộ và khách hàng của hệ thống</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="md" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setUserToEdit(null)
                setIsModalOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-1 inline-block" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {globalError && (
          <Alert variant="error" title="Thông báo hệ thống">
            {globalError}
          </Alert>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã, họ tên, SĐT hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15 outline-none"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15 outline-none"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
            <option value="STAFF">Nhân viên (STAFF)</option>
            <option value="DRIVER">Tài xế (DRIVER)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>
        </div>

        {/* User Table Component */}
        <UserTable
          users={filteredUsers}
          isLoading={isLoading}
          onEdit={(u) => {
            setUserToEdit(u)
            setIsModalOpen(true)
          }}
          onToggleStatus={handleToggleStatus}
          currentUserId={currentAdmin?.userId}
        />

        {/* User Form Modal Component */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          userToEdit={userToEdit}
          isLoading={isSubmitting}
        />
      </div>
    )
  }

  export default AdminDashboardPage
  ```

- [ ] **Step 3.2: Xóa hoặc chuyển hướng `src/pages/AdminDashboardPage.tsx` cũ**
  - Thay thế trực tiếp file cũ bằng phiên bản mới tại `src/pages/admin/AdminDashboardPage.tsx` (hoặc cập nhật đường dẫn tương ứng).

- [ ] **Step 3.3: Kiểm tra TypeScript & Lint cho Task 3**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit && npm run lint`
  Expected: 0 errors.

- [ ] **Step 3.4: Commit Task 3**
  ```bash
  git add client/src/pages/admin/AdminDashboardPage.tsx
  git commit -m "feat(admin): xay dung AdminDashboardPage quan ly nguoi dung va optimistic toggle"
  ```

---

### Task 4 — Router Integration & Final Verification

> **Mục tiêu:** Cập nhật `src/router/index.tsx` để trỏ route `/admin` vào trang `AdminDashboardPage` mới trong `src/pages/admin/`, bảo vệ bởi `<ProtectedRoute allowedRoles={['ADMIN']} />`.

**Files:**
- Modify: `client/src/router/index.tsx`

**Interfaces:**
- Consumes: `AdminDashboardPage` từ `src/pages/admin/AdminDashboardPage.tsx`
- Produces: Route `/admin` hoàn chỉnh.

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
  import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
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

- [ ] **Step 4.2: Dọn dẹp file mock `client/src/pages/AdminDashboardPage.tsx` cũ nếu không còn sử dụng**
  ```bash
  git rm client/src/pages/AdminDashboardPage.tsx
  ```

- [ ] **Step 4.3: Chạy kiểm thử TypeScript toàn Frontend**
  Run: `cd client && npx tsc -p tsconfig.app.json --noEmit`
  Expected: Không có bất kỳ lỗi biên dịch nào (0 errors).

- [ ] **Step 4.4: Chạy ESLint kiểm tra code style toàn Frontend**
  Run: `cd client && npm run lint`
  Expected: 0 warnings, 0 errors.

- [ ] **Step 4.5: Commit Router Integration & Verification**
  ```bash
  git add client/src/router/index.tsx
  git commit -m "feat(router): cap nhat route /admin tro vao trang AdminDashboardPage moi"
  ```
