import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/app-error.js'
import { authRepository } from './auth.repository.js'
import type { RegisterDto } from './auth.schema.js'

function signJwt(payload: { userId: string; role: string }): string {
	return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export async function register(
	dto: RegisterDto
): Promise<{ token: string; isUpgrade: boolean }> {
	// BƯỚC 1: Tìm user theo phone (Anchor Identity)
	const existingUser = await authRepository.findByPhone(dto.phone)

	// BƯỚC 2: PHÂN NHÁNH STATE MACHINE
	if (existingUser === null) {
		// ──── NHÁNH A: KHÁCH MỚI HOÀN TOÀN ────
		const passwordHash = await bcrypt.hash(dto.password, 12)
		const userId = `USR-${crypto.randomUUID()}`

		await authRepository.createCustomer({
			userId,
			fullName: dto.fullName,
			phone: dto.phone,
			email: dto.email,
			passwordHash,
		})

		const token = signJwt({ userId, role: 'CUSTOMER' })
		return { token, isUpgrade: false }
	}

	if (existingUser.role !== 'GUEST') {
		// ──── NHÁNH B: SĐT ĐÃ CÓ TÀI KHOẢN (CUSTOMER/ADMIN/DRIVER...) ────
		throw new AppError(
			409,
			'Số điện thoại đã được đăng ký tài khoản. Vui lòng đăng nhập!'
		)
	}

	// ──── NHÁNH C: KHÁCH VÃNG LAI (GUEST) → IN-PLACE UPGRADE ────
	// BƯỚC 2c-1: CROSS-IDENTITY EMAIL CHECK (Security Gate)
	if (dto.email.toLowerCase() !== existingUser.email.toLowerCase()) {
		throw new AppError(
			409,
			'Số điện thoại này đã gắn với email đặt vé khác. Vui lòng nhập đúng email đã dùng khi đặt vé để xác thực quyền sở hữu!'
		)
	}

	// BƯỚC 2c-2: Tiến hành In-place Upgrade
	const passwordHash = await bcrypt.hash(dto.password, 12)
	await authRepository.updateGuestToCustomer({
		phone: dto.phone,
		fullName: dto.fullName,
		passwordHash,
	})

	// BƯỚC 2c-3: Ký JWT với user_id của bản ghi CŨ (bảo toàn foreign key reference)
	const token = signJwt({ userId: existingUser.user_id, role: 'CUSTOMER' })
	return { token, isUpgrade: true }
}

export const authService = {
	register,
}
