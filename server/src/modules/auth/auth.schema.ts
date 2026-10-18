import { z } from 'zod'

export const registerSchema = z.object({
	fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên không được vượt quá 100 ký tự').trim(),
	phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
	email: z.string().email('Email không hợp lệ').toLowerCase(),
	password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
})

export type RegisterDto = z.infer<typeof registerSchema>

export const loginSchema = z.object({
	phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
	password: z.string().min(1, 'Mật khẩu không được để trống'),
})

export type LoginDto = z.infer<typeof loginSchema>
