import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { AppError } from '../../utils/app-error.js'
import { authService } from './auth.service.js'
import type { LoginDto, RegisterDto } from './auth.schema.js'

export const register: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const dto = req.body as RegisterDto
		const result = await authService.register(dto)

		const httpStatus = result.isUpgrade ? 200 : 201
		res.status(httpStatus).json({
			success: true,
			message: result.isUpgrade
				? 'Tài khoản đã được kích hoạt thành công.'
				: 'Đăng ký tài khoản thành công.',
			token: result.token,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const login: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const dto = req.body as LoginDto
		const result = await authService.login(dto)

		res.status(200).json({
			success: true,
			message: 'Đăng nhập thành công.',
			token: result.token,
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const me: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		const user = req.user
		if (user === undefined) {
			next(new AppError(401, 'Vui lòng đăng nhập để truy cập!'))
			return
		}

		res.status(200).json({
			success: true,
			data: {
				userId: user.userId,
				role: user.role,
			},
		})
	} catch (err: unknown) {
		next(err)
	}
}

export const authController = {
	register,
	login,
	me,
}

