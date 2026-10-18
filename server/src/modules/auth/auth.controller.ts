import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { authService } from './auth.service.js'
import type { RegisterDto } from './auth.schema.js'

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

export const authController = {
	register,
}
