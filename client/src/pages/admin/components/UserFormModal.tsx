import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type {
	AdminUser,
	CreateUserInput,
	UpdateUserInput,
} from '../../../types/admin'
import { Modal, Input, Select, Button, Alert } from '../../../components/common'

const userFormSchema = z.object({
	fullName: z
		.string()
		.min(2, 'Họ tên phải có ít nhất 2 ký tự')
		.max(100, 'Họ tên không được vượt quá 100 ký tự')
		.trim(),
	email: z.string().email('Email không đúng định dạng').trim(),
	phone: z
		.string()
		.regex(
			/^(0[3|5|7|8|9])+([0-9]{8})$/,
			'Số điện thoại không hợp lệ (10 số, đầu 03, 05, 07, 08, 09)'
		),
	role: z.enum(['CUSTOMER', 'STAFF', 'ADMIN', 'DRIVER']),
	password: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export interface UserFormModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (values: CreateUserInput | UpdateUserInput) => Promise<void>
	userToEdit?: AdminUser | null
	isLoading: boolean
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	userToEdit,
	isLoading,
}) => {
	const isEditMode = Boolean(userToEdit)
	const [formError, setFormError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors },
	} = useForm<UserFormValues>({
		resolver: zodResolver(userFormSchema),
		defaultValues: {
			fullName: '',
			email: '',
			phone: '',
			role: 'CUSTOMER',
			password: '',
		},
	})

	useEffect(() => {
		if (userToEdit) {
			reset({
				fullName: userToEdit.fullName,
				email: userToEdit.email,
				phone: userToEdit.phone,
				role: userToEdit.role,
				password: '',
			})
		} else {
			reset({
				fullName: '',
				email: '',
				phone: '',
				role: 'CUSTOMER',
				password: '',
			})
		}
	}, [userToEdit, reset])

	const handleClose = () => {
		setFormError(null)
		onClose()
	}

	const handleFormSubmit = async (data: UserFormValues) => {
		if (!isEditMode && (!data.password || data.password.length < 8)) {
			setError('password', {
				message: 'Mật khẩu phải có ít nhất 8 ký tự khi tạo mới tài khoản',
			})
			return
		}

		try {
			setFormError(null)
			if (isEditMode) {
				await onSubmit({
					fullName: data.fullName,
					email: data.email,
					phone: data.phone,
					role: data.role,
				})
			} else {
				await onSubmit({
					fullName: data.fullName,
					email: data.email,
					phone: data.phone,
					role: data.role,
					password: data.password || '',
				})
			}
			handleClose()
		} catch (err: unknown) {
			const errorMsg =
				(err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string')
					? (err as { message: string }).message
					: 'Thao tác không thành công. Vui lòng thử lại.'
			setFormError(errorMsg)
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
			description={
				isEditMode
					? `Cập nhật thông tin cho tài khoản mã ${userToEdit?.userId}`
					: 'Khởi tạo tài khoản nhân viên, tài xế hoặc khách hàng'
			}
		>
			{formError && (
				<div className="mb-4">
					<Alert variant="error" title="Lỗi gửi biểu mẫu">
						{formError}
					</Alert>
				</div>
			)}

			<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
				<Input
					label="Họ và tên"
					placeholder="Ví dụ: Nguyễn Văn An"
					error={errors.fullName?.message}
					{...register('fullName')}
				/>

				<Input
					label="Số điện thoại"
					type="tel"
					placeholder="Ví dụ: 0912345678"
					error={errors.phone?.message}
					{...register('phone')}
				/>

				<Input
					label="Địa chỉ Email"
					type="email"
					placeholder="user@xeviet.vn"
					error={errors.email?.message}
					{...register('email')}
				/>

				<Select
					label="Vai trò (Role)"
					options={[
						{ value: 'CUSTOMER', label: 'CUSTOMER (Khách hàng)' },
						{ value: 'STAFF', label: 'STAFF (Nhân viên phòng vé)' },
						{ value: 'DRIVER', label: 'DRIVER (Tài xế lái xe)' },
						{ value: 'ADMIN', label: 'ADMIN (Quản trị viên hệ thống)' },
					]}
					{...register('role')}
				/>

				{!isEditMode && (
					<Input
						label="Mật khẩu khởi tạo"
						type="password"
						placeholder="Tối thiểu 8 ký tự"
						error={errors.password?.message}
						{...register('password')}
					/>
				)}

				<div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
					<Button variant="outline" onClick={handleClose} disabled={isLoading}>
						Hủy bỏ
					</Button>
					<Button type="submit" variant="primary" isLoading={isLoading}>
						{isEditMode ? 'Lưu thay đổi' : 'Tạo tài khoản'}
					</Button>
				</div>
			</form>
		</Modal>
	)
}

export default UserFormModal
