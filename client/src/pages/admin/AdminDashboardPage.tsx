import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
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
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
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
		<div className="flex flex-col gap-5">
			{/* Top Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
				<div>
					<h2 className="text-xl font-bold text-slate-900">
						Quản lý tài khoản &amp; Người dùng
					</h2>
					<p className="text-xs text-slate-500 mt-0.5">
						Quản trị danh sách nhân sự, tài xế và khách hàng toàn hệ thống
					</p>
				</div>
				<div className="flex items-center gap-2.5">
					<Button
						variant="outline"
						size="md"
						icon={
							<RefreshCw
								className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
							/>
						}
						onClick={handleRefresh}
						disabled={isLoading}
					>
						Làm mới
					</Button>
					<Button
						variant="primary"
						size="md"
						icon={<Plus className="w-4 h-4" />}
						onClick={() => {
							setUserToEdit(null)
							setIsModalOpen(true)
						}}
					>
						Thêm người dùng
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
				<div className="flex-1 w-full">
					<Input
						icon={<Search className="w-4 h-4" />}
						placeholder="Tìm kiếm theo mã, họ tên, số điện thoại hoặc email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="w-full sm:w-60">
					<Select
						value={selectedRole}
						onChange={(e) => setSelectedRole(e.target.value)}
						aria-label="Lọc theo vai trò"
						options={[
							{ value: 'ALL', label: 'Tất cả vai trò' },
							{ value: 'CUSTOMER', label: 'Khách hàng (CUSTOMER)' },
							{ value: 'STAFF', label: 'Nhân viên (STAFF)' },
							{ value: 'DRIVER', label: 'Tài xế (DRIVER)' },
							{ value: 'ADMIN', label: 'Quản trị viên (ADMIN)' },
						]}
					/>
				</div>
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
