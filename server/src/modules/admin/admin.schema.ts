import { z } from 'zod'

const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/

export const createUserSchema = z.object({
	fullName: z
		.string()
		.min(2, 'Họ tên phải có ít nhất 2 ký tự')
		.max(100, 'Họ tên không vượt quá 100 ký tự')
		.trim(),
	email: z.string().email('Email không đúng định dạng').max(100).trim(),
	phone: z
		.string()
		.regex(
			phoneRegex,
			'Số điện thoại không hợp lệ (phải là số di động VN 10 chữ số)'
		),
	password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
	role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN', 'DRIVER']),
})

export const updateUserSchema = z.object({
	fullName: z
		.string()
		.min(2, 'Họ tên phải có ít nhất 2 ký tự')
		.max(100, 'Họ tên không vượt quá 100 ký tự')
		.trim(),
	email: z.string().email('Email không đúng định dạng').max(100).trim(),
	phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ'),
	role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN', 'DRIVER']),
})

export const updateUserStatusSchema = z.object({
	isActive: z.boolean({
		message: 'Trạng thái hoạt động (isActive) là bắt buộc',
	}),
})

export type CreateUserDto = z.infer<typeof createUserSchema>
export type UpdateUserDto = z.infer<typeof updateUserSchema>
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>
