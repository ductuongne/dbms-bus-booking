import React from 'react'
import { Edit2, Lock, Unlock, Loader2, UserX } from 'lucide-react'
import type { AdminUser } from '../../../types/admin'
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	Badge,
	Button,
} from '../../../components/common'

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
	currentUserId,
}) => {
	if (isLoading) {
		return (
			<div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
				<Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
				<p className="mt-3 text-sm font-medium text-slate-500">
					Đang tải danh sách người dùng từ hệ thống...
				</p>
			</div>
		)
	}

	if (users.length === 0) {
		return (
			<div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
				<UserX className="w-12 h-12 text-slate-300" />
				<h4 className="mt-3 text-base font-bold text-slate-800">
					Không tìm thấy người dùng
				</h4>
				<p className="mt-1 text-xs text-slate-500">
					Chưa có người dùng nào hoặc từ khóa tìm kiếm không khớp với kết quả.
				</p>
			</div>
		)
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Mã tài khoản</TableHead>
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
							<TableCell className="font-mono text-xs font-bold text-slate-600">
								{user.userId}
							</TableCell>
							<TableCell className="font-semibold text-slate-900">
								{user.fullName}
							</TableCell>
							<TableCell>
								<div className="text-xs space-y-0.5">
									<p className="font-medium text-slate-800">{user.phone}</p>
									<p className="text-slate-400">{user.email}</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="role" role={user.role} />
							</TableCell>
							<TableCell className="font-semibold text-slate-700">
								{user.loyaltyPoints}
							</TableCell>
							<TableCell>
								<Badge variant="status" isActive={user.isActive} />
							</TableCell>
							<TableCell className="text-right">
								<div className="inline-flex items-center gap-1.5 justify-end">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(user)}
										title="Chỉnh sửa thông tin người dùng"
										className="cursor-pointer"
									>
										<Edit2 className="w-3.5 h-3.5" />
									</Button>
									<Button
										variant={user.isActive ? 'outline' : 'primary'}
										size="sm"
										disabled={isSelf}
										onClick={() => onToggleStatus(user)}
										title={
											isSelf
												? 'Không thể tự khóa tài khoản của chính mình'
												: user.isActive
												? 'Khóa tài khoản'
												: 'Mở khóa tài khoản'
										}
										className={
											user.isActive
												? 'hover:border-rose-300 hover:text-rose-600 cursor-pointer'
												: 'cursor-pointer'
										}
									>
										{user.isActive ? (
											<Lock className="w-3.5 h-3.5 text-rose-500" />
										) : (
											<Unlock className="w-3.5 h-3.5" />
										)}
									</Button>
								</div>
							</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)
}

export default UserTable
