import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/app-error.js'
import { authRepository } from './auth.repository.js'
import type { LoginDto, RegisterDto } from './auth.schema.js'

function signAccessToken(payload: { userId: string; role: string }): string {
	return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessExpiresIn as any })
}

function signRefreshToken(payload: { userId: string; role: string }): string {
	return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn as any })
}

export async function login(dto: LoginDto): Promise<{
	token: string
	accessToken: string
	refreshToken: string
	user: {
		userId: string
		fullName: string
		phone: string
		role: string
		email: string
	}
}> {
	// Tìm tài khoản theo số điện thoại
	const user = await authRepository.findByPhone(dto.phone)

	// Guard 1: Chống user enumeration (trả 401 chung nếu không tìm thấy user)
	if (user === null) {
		throw new AppError(401, 'Số điện thoại hoặc mật khẩu không chính xác.')
	}

	// Guard 2: Chặn tài khoản GUEST chưa thiết lập mật khẩu
	if (user.role === 'GUEST' || user.password_hash === null) {
		throw new AppError(
			403,
			'Tài khoản của bạn là khách vãng lai chưa có mật khẩu. Vui lòng chọn Đăng ký để thiết lập tài khoản!'
		)
	}

	// Guard 3: Kiểm tra trạng thái tài khoản đang hoạt động (active)
	if (user.is_active === false || (user.is_active as unknown) === 0) {
		throw new AppError(
			403,
			'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.'
		)
	}

	// Guard 4: So khớp mật khẩu với hash (bcrypt)
	const passwordMatch = await bcrypt.compare(dto.password, user.password_hash)
	if (!passwordMatch) {
		throw new AppError(401, 'Số điện thoại hoặc mật khẩu không chính xác.')
	}

	// Xác thực thành công: Cấp phát Access Token & Refresh Token
	const accessToken = signAccessToken({ userId: user.user_id, role: user.role })
	const refreshToken = signRefreshToken({ userId: user.user_id, role: user.role })
	return {
		token: accessToken,
		accessToken,
		refreshToken,
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
): Promise<{ token: string; accessToken: string; refreshToken: string; isUpgrade: boolean }> {
	// Tìm tài khoản theo số điện thoại (Anchor Identity)
	const existingUser = await authRepository.findByPhone(dto.phone)

	// Nhánh 1: Khách hàng mới hoàn toàn -> Tạo mới tài khoản CUSTOMER
	if (existingUser === null) {
		const passwordHash = await bcrypt.hash(dto.password, 12)
		const userId = `USR-${crypto.randomUUID()}`

		await authRepository.createCustomer({
			userId,
			fullName: dto.fullName,
			phone: dto.phone,
			email: dto.email,
			passwordHash,
		})

		const accessToken = signAccessToken({ userId, role: 'CUSTOMER' })
		const refreshToken = signRefreshToken({ userId, role: 'CUSTOMER' })
		return { token: accessToken, accessToken, refreshToken, isUpgrade: false }
	}

	// Nhánh 2: Số điện thoại đã được đăng ký tài khoản chính thức
	if (existingUser.role !== 'GUEST') {
		throw new AppError(
			409,
			'Số điện thoại đã được đăng ký tài khoản. Vui lòng đăng nhập!'
		)
	}

	// Nhánh 3: Khách vãng lai (GUEST) nâng cấp thành tài khoản chính thức (In-place Upgrade)
	// Xác thực quyền sở hữu: Email đăng ký phải trùng khớp với email đã dùng khi đặt vé
	if (dto.email.toLowerCase() !== existingUser.email.toLowerCase()) {
		throw new AppError(
			409,
			'Số điện thoại này đã gắn với email đặt vé khác. Vui lòng nhập đúng email đã dùng khi đặt vé để xác thực quyền sở hữu!'
		)
	}

	// Cập nhật thông tin và mật khẩu cho tài khoản GUEST
	const passwordHash = await bcrypt.hash(dto.password, 12)
	await authRepository.updateGuestToCustomer({
		phone: dto.phone,
		fullName: dto.fullName,
		passwordHash,
	})

	// Ký token với user_id hiện có để bảo toàn foreign key references của các vé đã đặt
	const accessToken = signAccessToken({ userId: existingUser.user_id, role: 'CUSTOMER' })
	const refreshToken = signRefreshToken({ userId: existingUser.user_id, role: 'CUSTOMER' })
	return { token: accessToken, accessToken, refreshToken, isUpgrade: true }
}

export async function refreshAccessToken(
	refreshTokenInput: string
): Promise<{ accessToken: string; token: string }> {
	if (!refreshTokenInput || typeof refreshTokenInput !== 'string') {
		throw new AppError(400, 'Refresh token không được để trống!')
	}

	try {
		const decoded = jwt.verify(refreshTokenInput, env.jwtRefreshSecret) as unknown as {
			userId: string
			role: string
		}

		const user = await authRepository.findUserById(decoded.userId)
		if (!user || user.is_active === false || (user.is_active as unknown) === 0) {
			throw new AppError(401, 'Tài khoản không tồn tại hoặc đã bị khóa!')
		}

		const newAccessToken = signAccessToken({ userId: user.user_id, role: user.role })
		return {
			accessToken: newAccessToken,
			token: newAccessToken,
		}
	} catch (err: unknown) {
		if (err instanceof AppError) {
			throw err
		}
		throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn!')
	}
}

export const authService = {
	register,
	login,
	refreshAccessToken,
}

