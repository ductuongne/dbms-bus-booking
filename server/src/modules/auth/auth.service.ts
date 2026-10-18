import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/app-error.js'
import { authRepository } from './auth.repository.js'
import type { LoginDto, RegisterDto } from './auth.schema.js'

function signJwt(payload: { userId: string; role: string }): string {
	return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' })
}

export async function login(dto: LoginDto): Promise<{
	token: string
	user: {
		userId: string
		fullName: string
		phone: string
		role: string
		email: string
	}
}> {
	// BƯỚC 1: Truy vấn user theo SĐT
	const user = await authRepository.findByPhone(dto.phone)

	// ──── GUARD 1: ANTI-ENUMERATION GUARD ────
	if (user === null) {
		throw new AppError(401, 'Số điện thoại hoặc mật khẩu không chính xác.')
	}

	// ──── GUARD 2: GUEST ACCOUNT GUARD ────
	if (user.role === 'GUEST' || user.password_hash === null) {
		throw new AppError(
			403,
			'Tài khoản của bạn là khách vãng lai chưa có mật khẩu. Vui lòng chọn Đăng ký để thiết lập tài khoản!'
		)
	}

	// ──── GUARD 3: ACTIVE GUARD ────
	if (user.is_active === false || (user.is_active as unknown) === 0) {
		throw new AppError(
			403,
			'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.'
		)
	}

	// ──── GUARD 4: PASSWORD GUARD ────
	const passwordMatch = await bcrypt.compare(dto.password, user.password_hash)
	if (!passwordMatch) {
		throw new AppError(401, 'Số điện thoại hoặc mật khẩu không chính xác.')
	}

	// ──── SUCCESS ────
	const token = signJwt({ userId: user.user_id, role: user.role })
	return {
		token,
		user: {
			userId: user.user_id,
			fullName: user.full_name,
			phone: user.phone,
			role: user.role,
			email: user.email,
		},
	}
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
	login,
}

