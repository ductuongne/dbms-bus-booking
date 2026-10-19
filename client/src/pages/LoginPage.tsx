import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import { z } from 'zod'
import { Bus, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import type { ApiErrorResponse } from '../types/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

const loginSchema = z.object({
	phone: z
		.string()
		.regex(
			/^(0[3|5|7|8|9])+([0-9]{8})$/,
			'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
		),
	password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LocationState {
	from?: { pathname: string }
	registeredSuccess?: boolean
}

export const LoginPage: React.FC = () => {
	const { login, isAuthenticated, user, logout } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [serverError, setServerError] = useState<string | null>(null)

	const locationState = location.state as LocationState | null
	const registeredSuccess = locationState?.registeredSuccess
	const redirectUrl = locationState?.from?.pathname || '/'

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		mode: 'onTouched',
		defaultValues: {
			phone: '',
			password: '',
		},
	})

	const onSubmit = async (data: LoginFormData) => {
		try {
			setServerError(null)
			// Thử endpoint chuẩn /public/login, fallback /public/auth/login nếu cần
			let response
			try {
				response = await api.post('/public/login', data)
			} catch (postErr) {
				if (
					postErr instanceof AxiosError &&
					postErr.response?.status === 404
				) {
					response = await api.post('/public/auth/login', data)
				} else {
					throw postErr
				}
			}

			const token = response.data?.data?.token || response.data?.token
			const loggedInUser = response.data?.data?.user || response.data?.user
			if (!token) {
				throw new Error('Không nhận được mã xác thực (token) từ máy chủ.')
			}
			login(token, loggedInUser)
			navigate(redirectUrl, { replace: true })
		} catch (err: unknown) {
			if (err instanceof AxiosError && err.response?.data) {
				const apiErr = err.response.data as ApiErrorResponse
				setServerError(
					apiErr.message ||
						'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.'
				)
			} else if (err instanceof Error) {
				setServerError(err.message)
			} else {
				setServerError(
					'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
				)
			}
		}
	}

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/70 px-4 py-12">
			<div className="w-full max-w-md space-y-6">
				{/* Header Branding RedBus */}
				<div className="text-center space-y-2">
					<div className="inline-flex w-12 h-12 rounded-2xl bg-[#FF385C] items-center justify-center text-white shadow-md shadow-red-500/30">
						<Bus className="w-6 h-6" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900">
						Đăng nhập tài khoản
					</h1>
					<p className="text-sm text-slate-500">
						Đặt vé xe khách nhanh chóng và an toàn cùng redBus
					</p>
				</div>

				{/* Card Container */}
				<div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
					{isAuthenticated ? (
						<div className="space-y-4">
							<Alert variant="success" title="Đang trong phiên đăng nhập">
								Bạn hiện đang đăng nhập với tài khoản{' '}
								<strong>{user?.fullName || user?.userId}</strong> ({user?.role}
								).
							</Alert>

							<div className="space-y-2 pt-2">
								<Button
									variant="primary"
									fullWidth
									onClick={() => navigate(redirectUrl, { replace: true })}
								>
									Tiếp tục tới {redirectUrl}
								</Button>
								<Button variant="outline" fullWidth onClick={logout}>
									Đăng xuất phiên hiện tại
								</Button>
							</div>
						</div>
					) : (
						<>
							{registeredSuccess && (
								<div className="mb-5">
									<Alert variant="success" title="Đăng ký thành công">
										Tài khoản của bạn đã được khởi tạo. Vui lòng đăng nhập để
										bắt đầu đặt vé!
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

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-4"
								noValidate
							>
								<Input
									id="login-phone"
									label="Số điện thoại"
									type="tel"
									placeholder="Ví dụ: 0912345678"
									autoComplete="tel"
									error={errors.phone?.message}
									{...register('phone')}
								/>

								<Input
									id="login-password"
									label="Mật khẩu"
									type="password"
									placeholder="Nhập mật khẩu"
									autoComplete="current-password"
									error={errors.password?.message}
									{...register('password')}
								/>

								<div className="pt-2">
									<Button
										type="submit"
										variant="primary"
										fullWidth
										isLoading={isSubmitting}
									>
										<LogIn className="w-4 h-4 mr-1 inline-block" />
										Đăng nhập
									</Button>
								</div>
							</form>

							<div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
								Chưa có tài khoản?{' '}
								<Link
									to="/register"
									className="font-semibold text-[#FF385C] hover:underline transition-colors"
								>
									Đăng ký ngay
								</Link>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default LoginPage
