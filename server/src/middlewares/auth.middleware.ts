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

export const verifyJWT: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	// BƯỚC 1: Extract Authorization header
	const authHeader = req.headers['authorization']

	// BƯỚC 2: Validate header format "Bearer <token>"
	if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
		next(new AppError(401, 'Vui lòng đăng nhập để truy cập!'))
		return
	}

	// BƯỚC 3: Extract token (bỏ prefix "Bearer ")
	const token = authHeader.slice(7)

	// BƯỚC 4: Xác minh token toán học (sync — không cần await)
	try {
		const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload

		// BƯỚC 5: Gán req.user (strongly typed nhờ Task 1)
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

export function checkRole(allowedRoles: UserRole[]): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction): void => {
		// Guard: req.user phải được gán bởi verifyJWT trước đó
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
