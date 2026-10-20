import { getPool, sql } from '../../config/db.js'
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
	const pool = await getPool()
	const request = pool.request()

	const result = await request.query<AdminUserResponseDto>(
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
	return result.recordset
}

export async function findById(
	userId: string
): Promise<AdminUserResponseDto | null> {
	const pool = await getPool()
	const request = pool.request()
	request.input('userId', sql.VarChar(50), userId)

	const result = await request.query<AdminUserResponseDto>(
		`SELECT user_id AS userId,
		        full_name AS fullName,
		        email,
		        phone,
		        role,
		        loyalty_points AS loyaltyPoints,
		        is_active AS isActive
		 FROM users
		 WHERE user_id = @userId`
	)
	const row = result.recordset[0]
	return row ?? null
}

export async function create(data: CreateAdminUserData): Promise<void> {
	const pool = await getPool()
	const request = pool.request()

	request.input('userId', sql.VarChar(50), data.userId)
	request.input('fullName', sql.NVarChar(100), data.fullName)
	request.input('email', sql.VarChar(100), data.email)
	request.input('phone', sql.VarChar(20), data.phone)
	request.input('passwordHash', sql.VarChar(255), data.passwordHash)
	request.input('role', sql.VarChar(20), data.role)

	try {
		await request.query(
			`INSERT INTO users (user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active)
			 VALUES (@userId, @fullName, @email, @phone, @passwordHash, @role, 0, 1)`
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
	const pool = await getPool()
	const request = pool.request()

	request.input('userId', sql.VarChar(50), userId)
	request.input('fullName', sql.NVarChar(100), data.fullName)
	request.input('email', sql.VarChar(100), data.email)
	request.input('phone', sql.VarChar(20), data.phone)
	request.input('role', sql.VarChar(20), data.role)

	try {
		const result = await request.query(
			`UPDATE users
			 SET full_name = @fullName,
			     email = @email,
			     phone = @phone,
			     role = @role
			 WHERE user_id = @userId`
		)
		const affected = result.rowsAffected[0]
		if (affected === undefined || affected === 0) {
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
	const pool = await getPool()
	const request = pool.request()

	request.input('userId', sql.VarChar(50), userId)
	request.input('isActive', sql.Bit, isActive ? 1 : 0)

	const result = await request.query(
		`UPDATE users
		 SET is_active = @isActive
		 WHERE user_id = @userId`
	)
	const affected = result.rowsAffected[0]
	if (affected === undefined || affected === 0) {
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
