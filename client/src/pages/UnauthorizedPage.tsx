import React from 'react'
import { Link } from 'react-router-dom'

export const UnauthorizedPage: React.FC = () => {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<h1 className="text-6xl font-black text-rose-600">403</h1>
				<h2 className="mt-4 text-2xl font-bold text-slate-800">
					Truy cập bị từ chối
				</h2>
				<p className="mt-2 text-sm text-slate-600">
					Tài khoản của bạn không có quyền hạn (Role) để truy cập vào tài
					nguyên này.
				</p>
				<div className="mt-6 flex flex-col gap-3">
					<Link
						to="/"
						className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700"
					>
						Về trang chủ
					</Link>
					<Link
						to="/login"
						className="text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline"
					>
						Đăng nhập bằng tài khoản khác
					</Link>
				</div>
			</div>
		</div>
	)
}

export default UnauthorizedPage
