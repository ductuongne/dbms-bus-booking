import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const AdminDashboardPage: React.FC = () => {
	const { user, logout } = useAuth()

	return (
		<div className="mx-auto max-w-5xl p-8">
			<div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<div className="flex items-center justify-between border-b border-slate-100 pb-6">
					<div>
						<span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
							Admin Security Portal
						</span>
						<h1 className="mt-2 text-3xl font-extrabold text-slate-900">
							Bảng Điều Khiển Quản Trị Viên
						</h1>
					</div>

					<button
						type="button"
						onClick={logout}
						className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
					>
						Đăng xuất
					</button>
				</div>

				<div className="mt-6 space-y-4">
					<p className="text-slate-600">
						Xin chào <strong className="text-slate-900">{user?.userId}</strong>!
						Bạn đang truy cập vào tuyến đường được bảo vệ nghiêm ngặt bằng{' '}
						<code className="rounded bg-slate-100 px-2 py-0.5 text-sm font-bold text-blue-600">
							&lt;ProtectedRoute allowedRoles={['ADMIN']}&gt;
						</code>
						.
					</p>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-4">
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
							<p className="text-xs font-semibold uppercase text-slate-500">
								Role Hiện Tại
							</p>
							<p className="mt-2 text-2xl font-bold text-blue-600">
								{user?.role}
							</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
							<p className="text-xs font-semibold uppercase text-slate-500">
								Trạng Thái Session
							</p>
							<p className="mt-2 text-2xl font-bold text-emerald-600">
								Active
							</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
							<p className="text-xs font-semibold uppercase text-slate-500">
								RBAC Security
							</p>
							<p className="mt-2 text-2xl font-bold text-purple-600">
								Enforced
							</p>
						</div>
					</div>

					<div className="pt-6">
						<Link
							to="/"
							className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline"
						>
							&larr; Quay lại trang chủ
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminDashboardPage
