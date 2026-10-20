import { sql } from '../../config/db.js'
import { executeQuery } from '../../database/query.js'
import type {
	AdminUserResponseDto,
	CreateAdminUserData,
	UpdateAdminUserData,
} from '../../types/index.js'
import { AppError } from '../../utils/app-error.js'

function isSqlUniqueViolation(err: unknown): boolean {
	if (typeof err === 'object' && err !== null && 'number' in err) {
		const errNumber = (err as { number: unknown }).number
		return errNumber === 2627 || errNumber === 2601
	}
	return false
}

export async function findAll(): Promise<AdminUserResponseDto[]> {
	return executeQuery<AdminUserResponseDto>(
		`SELECT user_id AS userId,
		        full_name AS fullName,
		        email,
		        phone,
		        role,
		        loyalty_points AS loyaltyPoints,
		        is_active AS isActive
		 FROM users
		 ORDER BY user_id DESC`
	)
}

export async function findById(
	userId: string
): Promise<AdminUserResponseDto | null> {
	const rows = await executeQuery<AdminUserResponseDto>(
		`SELECT user_id AS userId,
		        full_name AS fullName,
		        email,
		        phone,
		        role,
		        loyalty_points AS loyaltyPoints,
		        is_active AS isActive
		 FROM users
		 WHERE user_id = @userId`,
		{ userId: { type: sql.VarChar(50), value: userId } }
	)
	return rows[0] ?? null
}

export async function create(data: CreateAdminUserData): Promise<void> {
	try {
		await executeQuery(
			`INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active)
			 VALUES (@userId, @fullName, @email, @phone, @passwordHash, @role, 0, 1)`,
			{
				userId: { type: sql.VarChar(50), value: data.userId },
				fullName: { type: sql.NVarChar(100), value: data.fullName },
				email: { type: sql.VarChar(100), value: data.email },
				phone: { type: sql.VarChar(20), value: data.phone },
				passwordHash: { type: sql.VarChar(255), value: data.passwordHash },
				role: { type: sql.VarChar(20), value: data.role },
			}
		)
	} catch (err: unknown) {
		if (isSqlUniqueViolation(err)) {
			const errMsg = err instanceof Error ? err.message.toLowerCase() : ''
			if (errMsg.includes('uq_user_phone')) {
				throw new AppError(
					409,
					'Số điện thoại này đã được đăng ký trong hệ thống!'
				)
			}
			if (errMsg.includes('uq_user_email')) {
				throw new AppError(
					409,
					'Email này đã được đăng ký trong hệ thống!'
				)
			}
			throw new AppError(
				409,
				'Số điện thoại hoặc email đã tồn tại trong hệ thống!'
			)
		}
		throw err
	}
}

export async function update(
	userId: string,
	data: UpdateAdminUserData
): Promise<void> {
	try {
		const rows = await executeQuery<{ user_id: string }>(
			`UPDATE users
			 SET full_name = @fullName,
			     email = @email,
			     phone = @phone,
			     role = @role
			 OUTPUT inserted.user_id
			 WHERE user_id = @userId`,
			{
				userId: { type: sql.VarChar(50), value: userId },
				fullName: { type: sql.NVarChar(100), value: data.fullName },
				email: { type: sql.VarChar(100), value: data.email },
				phone: { type: sql.VarChar(20), value: data.phone },
				role: { type: sql.VarChar(20), value: data.role },
			}
		)
		if (rows.length === 0) {
			throw new AppError(404, 'Không tìm thấy người dùng!')
		}
	} catch (err: unknown) {
		if (err instanceof AppError) {
			throw err
		}
		if (isSqlUniqueViolation(err)) {
			const errMsg = err instanceof Error ? err.message.toLowerCase() : ''
			if (errMsg.includes('uq_user_phone')) {
				throw new AppError(
					409,
					'Số điện thoại này đã được đăng ký cho người dùng khác!'
				)
			}
			if (errMsg.includes('uq_user_email')) {
				throw new AppError(
					409,
					'Email này đã được đăng ký cho người dùng khác!'
				)
			}
			throw new AppError(
				409,
				'Số điện thoại hoặc email đã tồn tại trong hệ thống!'
			)
		}
		throw err
	}
}

export async function updateStatus(
	userId: string,
	isActive: boolean
): Promise<void> {
	const rows = await executeQuery<{ user_id: string }>(
		`UPDATE users
		 SET is_active = @isActive
		 OUTPUT inserted.user_id
		 WHERE user_id = @userId`,
		{
			userId: { type: sql.VarChar(50), value: userId },
			isActive: { type: sql.Bit, value: isActive ? 1 : 0 },
		}
	)
	if (rows.length === 0) {
		throw new AppError(404, 'Không tìm thấy người dùng!')
	}
}

export const adminRepository = {
	findAll,
	findById,
	create,
	update,
	updateStatus,
}
