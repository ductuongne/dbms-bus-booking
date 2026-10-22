import type { NextFunction, Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { UserRole } from '../types/index.js'
import { AppError } from '../utils/app-error.js'

interface JwtPayload {
	userId: string
	role: UserRole
	iat: number
	exp: number
}

/**
 * Middleware xác thực JSON Web Token (JWT) từ Authorization header
 */
export const verifyJWT: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers['authorization']

	// Kiểm tra định dạng Bearer token
	if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
		next(new AppError(401, 'Vui lòng đăng nhập để truy cập!'))
		return
	}

	const token = authHeader.slice(7)

	// Xác thực chữ ký và giải mã payload
	try {
		const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload
		req.user = { userId: decoded.userId, role: decoded.role }
		next()
	} catch (_err: unknown) {
		next(
			new AppError(
				401,
				'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!'
			)
		)
	}
}

/**
 * Middleware kiểm tra quyền truy cập theo vai trò (Role-Based Access Control)
 */
export function checkRole(allowedRoles: UserRole[]): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction): void => {
		// Yêu cầu request đã được xác thực qua verifyJWT
		if (req.user === undefined) {
			next(new AppError(401, 'Vui lòng đăng nhập để truy cập!'))
			return
		}

		if (!allowedRoles.includes(req.user.role)) {
			next(new AppError(403, 'Bạn không có quyền truy cập tài nguyên này!'))
			return
		}

		next()
	}
}
