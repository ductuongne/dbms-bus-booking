import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LoginPage: React.FC = () => {
	const { login, isAuthenticated, user, logout } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()

	// Lấy route trước đó nếu người dùng bị ProtectedRoute đá sang /login
	const locationState = location.state as { from?: { pathname: string } } | null
	const redirectUrl = locationState?.from?.pathname || '/'

	// Exact mock tokens from pseudo-code for instant zero-backend testing
	const MOCK_ADMIN_TOKEN =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItQURNSU4tMDEiLCJyb2xlIjoiQURNSU4iLCJleHAiOjQxMDI0NDQ4MDB9.dummySignature'

	const MOCK_CUST_TOKEN =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU1ItQ1VTVC0wMSIsInJvbGUiOiJDVVNUT01FUiIsImV4cCI6NDEwMjQ0NDgwMH0.dummySignature'

	const handleMockLogin = (token: string) => {
		login(token)
		navigate(redirectUrl, { replace: true })
	}

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
			<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
				<div className="mb-6 text-center">
					<h2 className="text-2xl font-bold text-slate-900">
						Security Test Login
					</h2>
					<p className="mt-1 text-sm text-slate-500">
						Mô phỏng xác thực và phân quyền RBAC Frontend
					</p>
				</div>

				{isAuthenticated ? (
					<div className="space-y-4">
						<div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
							<p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
								Trạng thái đăng nhập
							</p>
							<p className="mt-1 font-bold text-emerald-900">
								User ID: {user?.userId}
							</p>
							<p className="text-sm font-medium text-emerald-700">
								Vai trò (Role):{' '}
								<span className="rounded bg-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-900">
									{user?.role}
								</span>
							</p>
						</div>

						<button
							type="button"
							onClick={logout}
							className="w-full rounded-xl bg-rose-600 py-2.5 font-semibold text-white transition hover:bg-rose-700"
						>
							Đăng xuất phiên hiện tại
						</button>
					</div>
				) : (
					<div className="space-y-3">
						<button
							type="button"
							onClick={() => handleMockLogin(MOCK_ADMIN_TOKEN)}
							className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
						>
							Đăng nhập giả lập ADMIN
						</button>

						<button
							type="button"
							onClick={() => handleMockLogin(MOCK_CUST_TOKEN)}
							className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-[0.99]"
						>
							Đăng nhập giả lập CUSTOMER
						</button>

						{locationState?.from && (
							<p className="mt-3 text-center text-xs text-amber-600">
								* Bạn sẽ được chuyển tiếp về{' '}
								<code className="font-bold">{redirectUrl}</code> sau khi đăng
								nhập.
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

export default LoginPage
