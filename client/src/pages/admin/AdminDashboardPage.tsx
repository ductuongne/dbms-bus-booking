import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Plus, Search, RefreshCw, Users } from 'lucide-react'
import { AxiosError } from 'axios'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../lib/api'
import type {
	AdminUser,
	CreateUserInput,
	UpdateUserInput,
} from '../../types/admin'
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

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	// 1. Fetch Users List từ backend API khi mount
	useEffect(() => {
		let ignore = false

		const loadUsers = async () => {
			try {
				const response = await api.get('/private/admin/users')
				if (!ignore) {
					setUsers(response.data.data || [])
				}
			} catch (err: unknown) {
				if (!ignore) {
					if (err instanceof AxiosError && err.response?.data) {
						const apiErr = err.response.data as ApiErrorResponse
						setGlobalError(
							apiErr.message || 'Không thể tải danh sách người dùng.'
						)
					} else {
						setGlobalError('Lỗi kết nối máy chủ. Vui lòng kiểm tra và thử lại.')
					}
				}
			} finally {
				if (!ignore) {
					setIsLoading(false)
				}
			}
		}

		void loadUsers()

		return () => {
			ignore = true
		}
	}, [])

	// Thao tác làm mới thủ công từ nút bấm
	const handleRefresh = useCallback(async () => {
		setIsLoading(true)
		setGlobalError(null)
		try {
			const response = await api.get('/private/admin/users')
			setUsers(response.data.data || [])
		} catch (err: unknown) {
			if (err instanceof AxiosError && err.response?.data) {
				const apiErr = err.response.data as ApiErrorResponse
				setGlobalError(apiErr.message || 'Không thể tải danh sách người dùng.')
			} else {
				setGlobalError('Lỗi kết nối máy chủ. Vui lòng kiểm tra và thử lại.')
			}
		} finally {
			setIsLoading(false)
		}
	}, [])

	// 2. Optimistic UI Toggle Status (Soft-Delete) kèm rollback khi lỗi
	const handleToggleStatus = async (targetUser: AdminUser) => {
		const originalStatus = targetUser.isActive
		const newStatus = !originalStatus

		// Cập nhật lạc quan (Optimistic update) ngay lập tức trên UI
		setUsers((prev) =>
			prev.map((u) =>
				u.userId === targetUser.userId ? { ...u, isActive: newStatus } : u
			)
		)

		try {
			await api.patch(`/private/admin/users/${targetUser.userId}/status`, {
				isActive: newStatus,
			})
		} catch (err: unknown) {
			// Rollback lại trạng thái cũ ngay lập tức nếu API thất bại
			setUsers((prev) =>
				prev.map((u) =>
					u.userId === targetUser.userId
						? { ...u, isActive: originalStatus }
						: u
				)
			)

			const errorMsg =
				err instanceof AxiosError && err.response?.data?.message
					? err.response.data.message
					: 'Không thể thay đổi trạng thái tài khoản. Đã hoàn tác thao tác.'
			setGlobalError(errorMsg)
		}
	}

	// 3. Create or Update User Mutation
	const handleFormSubmit = async (
		formData: CreateUserInput | UpdateUserInput
	) => {
		setIsSubmitting(true)
		try {
			if (userToEdit) {
				// Update User Info
				const res = await api.put(
					`/private/admin/users/${userToEdit.userId}`,
					formData
				)
				const updatedUser: AdminUser = res.data.data
				setUsers((prev) =>
					prev.map((u) =>
						u.userId === updatedUser.userId ? updatedUser : u
					)
				)
			} else {
				// Create New User
				const res = await api.post('/private/admin/users', formData)
				const createdUser: AdminUser = res.data.data
				setUsers((prev) => [createdUser, ...prev])
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	// 4. Client-side Search & Role Filter
	const filteredUsers = useMemo(() => {
		return users.filter((u) => {
			const matchesRole =
				selectedRole === 'ALL' || u.role === selectedRole
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
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
				<div>
					<div className="flex items-center gap-2">
						<Users className="w-6 h-6 text-[#FF385C]" />
						<h1 className="text-2xl font-black text-slate-900 tracking-tight">
							Quản lý người dùng
						</h1>
					</div>
					<p className="text-xs text-slate-500 mt-1">
						Quản trị danh sách nhân sự, tài xế và khách hàng toàn hệ thống
					</p>
				</div>
				<div className="flex items-center gap-2.5">
					<Button
						variant="outline"
						size="md"
						onClick={handleRefresh}
						disabled={isLoading}
						className="cursor-pointer"
					>
						<RefreshCw
							className={`w-4 h-4 mr-1.5 inline-block ${
								isLoading ? 'animate-spin' : ''
							}`}
						/>
						<span>Làm mới</span>
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={() => {
							setUserToEdit(null)
							setIsModalOpen(true)
						}}
						className="cursor-pointer"
					>
						<Plus className="w-4 h-4 mr-1 inline-block" />
						<span>Thêm người dùng</span>
					</Button>
				</div>
			</div>

			{globalError && (
				<Alert variant="error" title="Thông báo hệ thống">
					{globalError}
				</Alert>
			)}

			{/* Filter & Search Bar */}
			<div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
				<div className="relative flex-1 w-full">
					<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
					<input
						type="text"
						placeholder="Tìm kiếm theo mã, họ tên, số điện thoại hoặc email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15 outline-none transition-all placeholder:text-slate-400"
					/>
				</div>
				<select
					value={selectedRole}
					onChange={(e) => setSelectedRole(e.target.value)}
					aria-label="Lọc theo vai trò"
					className="w-full sm:w-56 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-[#FF385C] focus:ring-4 focus:ring-red-500/15 outline-none transition-all cursor-pointer font-medium text-slate-700"
				>
					<option value="ALL">Tất cả vai trò</option>
					<option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
					<option value="STAFF">Nhân viên (STAFF)</option>
					<option value="DRIVER">Tài xế (DRIVER)</option>
					<option value="ADMIN">Quản trị viên (ADMIN)</option>
				</select>
			</div>

			{/* Presentational Table */}
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

			{/* Form Modal */}
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
