import { AsyncLocalStorage } from 'node:async_hooks'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { UserRole } from '../types/index.js'

export interface RequestSecurityContext {
	userId?: string | undefined
	role?: UserRole | undefined
}

interface JwtPayload {
	userId: string
	role: UserRole
	iat: number
	exp: number
}

export const securityContext = new AsyncLocalStorage<RequestSecurityContext>()

/**
 * Ánh xạ UserRole trong JWT sang Database User tương ứng trong SQL Server:
 * - ADMIN    => user_admin
 * - STAFF    => user_nhanvien
 * - DRIVER   => user_taixe
 * - CUSTOMER => user_khachhang
 */
export function getCurrentDbUser(): string | null {
	const store = securityContext.getStore()
	if (!store?.role) return null

	switch (store.role) {
		case 'ADMIN':
			return 'user_admin'
		case 'STAFF':
			return 'user_nhanvien'
		case 'DRIVER':
			return 'user_taixe'
		case 'CUSTOMER':
			return 'user_khachhang'
		default:
			return null
	}
}

/**
 * Global middleware gắn Request Security Context vào AsyncLocalStorage.
 * Tự động trích xuất token Bearer nếu có để truyền ngữ cảnh vai trò xuống SQL Server.
 */
export const requestContextMiddleware: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers['authorization']
	let userId: string | undefined
	let role: UserRole | undefined

	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.slice(7)
		try {
			const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload
			userId = decoded.userId
			role = decoded.role
		} catch {
			// Token không hợp lệ ở đây sẽ được xử lý nghiêm ngặt bởi verifyJWT ở route tương ứng
		}
	}

	securityContext.run({ userId, role }, () => {
		next()
	})
}
