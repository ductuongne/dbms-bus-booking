import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../../utils/app-error.js'
import { adminService } from './admin.service.js'
import type {
	CreateUserDto,
	UpdateUserDto,
	UpdateUserStatusDto,
} from './admin.schema.js'

export const listUsers: RequestHandler = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const users = await adminService.listUsers()
		res.status(200).json({
			success: true,
			data: users,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const createUser: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const dto = req.body as CreateUserDto
		const user = await adminService.createUser(dto)
		res.status(201).json({
			success: true,
			message: 'Tạo tài khoản người dùng thành công.',
			data: user,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const updateUser: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.params['id']
		if (typeof userId !== 'string' || userId.trim() === '') {
			throw new AppError(400, 'Thiếu mã người dùng (id)!')
		}

		const dto = req.body as UpdateUserDto
		const user = await adminService.updateUser(userId, dto)
		res.status(200).json({
			success: true,
			message: 'Cập nhật thông tin người dùng thành công.',
			data: user,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const updateUserStatus: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.params['id']
		if (typeof userId !== 'string' || userId.trim() === '') {
			throw new AppError(400, 'Thiếu mã người dùng (id)!')
		}

		const dto = req.body as UpdateUserStatusDto
		const currentAdminId = req.user?.userId
		await adminService.updateUserStatus(userId, dto.isActive, currentAdminId)

		const actionText = dto.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'
		res.status(200).json({
			success: true,
			message: `${actionText} tài khoản người dùng thành công.`,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const adminController = {
	listUsers,
	createUser,
	updateUser,
	updateUserStatus,
}
