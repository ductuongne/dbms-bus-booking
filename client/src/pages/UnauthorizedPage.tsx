import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const UnauthorizedPage: React.FC = () => {
	const { user } = useAuth()

	const getBackLink = () => {
		if (user?.role === 'STAFF') {
			return { to: '/admin/trips', label: 'Quay lại Quản lý chuyến xe' }
		}
		if (user?.role === 'ADMIN') {
			return { to: '/admin/reports', label: 'Quay lại Báo cáo quản trị' }
		}
		if (user?.role === 'DRIVER') {
			return { to: '/driver/schedules', label: 'Quay lại Lịch chạy' }
		}
		return { to: '/', label: 'Quay lại Trang chủ' }
	}

	const backLink = getBackLink()

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
					<ShieldAlert className="w-9 h-9" />
				</div>
				<h1 className="text-4xl font-black text-rose-600">403</h1>
				<h2 className="mt-3 text-xl font-bold text-slate-800">
					Bạn không có quyền xem trang này
				</h2>
				<p className="mt-2 text-sm text-slate-600">
					Tài khoản hiện tại ({user?.role || 'Khách'}) không được phân quyền để truy cập vào tài nguyên này. Vui lòng liên hệ Quản trị viên nếu bạn cần cấp quyền.
				</p>
				<div className="mt-6 flex flex-col gap-3">
					<Link
						to={backLink.to}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A5F] px-6 py-2.5 font-semibold text-white transition hover:bg-[#162C48] text-sm"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>{backLink.label}</span>
					</Link>
					<Link
						to="/login"
						className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline"
					>
						Đăng nhập bằng tài khoản khác
					</Link>
				</div>
			</div>
		</div>
	)
}

export default UnauthorizedPage

