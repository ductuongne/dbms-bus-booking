import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import { z } from 'zod'
import { Bus, UserPlus } from 'lucide-react'
import { api } from '../lib/api'
import type { ApiErrorResponse } from '../types/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

const registerSchema = z
	.object({
		fullName: z
			.string()
			.min(2, 'Họ và tên phải có ít nhất 2 ký tự')
			.max(100, 'Họ và tên không được vượt quá 100 ký tự')
			.trim(),
		phone: z
			.string()
			.regex(
				/^(0[3|5|7|8|9])+([0-9]{8})$/,
				'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
			),
		email: z
			.string()
			.email('Địa chỉ email không đúng định dạng')
			.toLowerCase()
			.trim(),
		password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
		confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Mật khẩu xác nhận không khớp',
		path: ['confirmPassword'],
	})

type RegisterFormData = z.infer<typeof registerSchema>

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
			const payload = {
				fullName: data.fullName,
				phone: data.phone,
				email: data.email,
				password: data.password,
			}

			// Thử endpoint chuẩn /public/register, fallback /public/auth/register nếu cần
			try {
				await api.post('/public/register', payload)
			} catch (postErr) {
				if (
					postErr instanceof AxiosError &&
					postErr.response?.status === 404
				) {
					await api.post('/public/auth/register', payload)
				} else {
					throw postErr
				}
			}

			// Chuyển hướng sang màn hình đăng nhập với thông báo thành công
			navigate('/login', {
				replace: true,
				state: { registeredSuccess: true },
			})
		} catch (err: unknown) {
			if (err instanceof AxiosError && err.response?.data) {
				const apiErr = err.response.data as ApiErrorResponse
				setServerError(
					apiErr.message ||
						'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'
				)
			} else {
				setServerError(
					'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
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
						Tạo tài khoản mới
					</h1>
					<p className="text-sm text-slate-500">
						Đăng ký để tích điểm thành viên và nhận ưu đãi chuyến đi
					</p>
				</div>

				{/* Card Container */}
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
							id="register-fullName"
							label="Họ và tên"
							placeholder="Ví dụ: Nguyễn Văn An"
							autoComplete="name"
							error={errors.fullName?.message}
							{...register('fullName')}
						/>

						<Input
							id="register-phone"
							label="Số điện thoại"
							type="tel"
							placeholder="Ví dụ: 0912345678"
							autoComplete="tel"
							error={errors.phone?.message}
							{...register('phone')}
						/>

						<Input
							id="register-email"
							label="Địa chỉ Email"
							type="email"
							placeholder="vidu@gmail.com"
							autoComplete="email"
							error={errors.email?.message}
							{...register('email')}
						/>

						<Input
							id="register-password"
							label="Mật khẩu"
							type="password"
							placeholder="Tối thiểu 8 ký tự"
							autoComplete="new-password"
							error={errors.password?.message}
							{...register('password')}
						/>

						<Input
							id="register-confirmPassword"
							label="Xác nhận mật khẩu"
							type="password"
							placeholder="Nhập lại mật khẩu"
							autoComplete="new-password"
							error={errors.confirmPassword?.message}
							{...register('confirmPassword')}
						/>

						<div className="pt-2">
							<Button
								type="submit"
								variant="primary"
								fullWidth
								isLoading={isSubmitting}
							>
								<UserPlus className="w-4 h-4 mr-1 inline-block" />
								Đăng ký tài khoản
							</Button>
						</div>
					</form>

					<div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
						Đã có tài khoản?{' '}
						<Link
							to="/login"
							className="font-semibold text-[#FF385C] hover:underline transition-colors"
						>
							Đăng nhập ngay
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RegisterPage
