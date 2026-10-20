import { sql } from '../../config/db.js'
import { executeQuery } from '../../database/query.js'
import { AppError } from '../../utils/app-error.js'
import type { CreateCustomerDto, UpdateGuestDto, UserRow } from '../../types/index.js'

function isSqlUniqueViolation(err: unknown): boolean {
	if (typeof err === 'object' && err !== null && 'number' in err) {
		const errNumber = (err as { number: unknown }).number
		return errNumber === 2627 || errNumber === 2601
	}
	return false
}

export async function findByPhone(phone: string): Promise<UserRow | null> {
	const rows = await executeQuery<UserRow>(
		`SELECT user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active
		 FROM users
		 WHERE phone = @phone`,
		{ phone: { type: sql.VarChar(20), value: phone } }
	)
	return rows[0] ?? null
}

export async function findUserById(userId: string): Promise<UserRow | null> {
	const rows = await executeQuery<UserRow>(
		`SELECT user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active
		 FROM users
		 WHERE user_id = @userId`,
		{ userId: { type: sql.VarChar(50), value: userId } }
	)
	return rows[0] ?? null
}

export async function createCustomer(dto: CreateCustomerDto): Promise<void> {
	try {
		await executeQuery(
			`INSERT INTO users (user_id, full_name, phone, email, password_hash, role, loyalty_points, is_active)
			 VALUES (@userId, @fullName, @phone, @email, @passwordHash, 'CUSTOMER', 0, 1)`,
			{
				userId: { type: sql.VarChar(50), value: dto.userId },
				fullName: { type: sql.NVarChar(100), value: dto.fullName },
				phone: { type: sql.VarChar(20), value: dto.phone },
				email: { type: sql.VarChar(100), value: dto.email },
				passwordHash: { type: sql.VarChar(255), value: dto.passwordHash },
			}
		)
	} catch (err: unknown) {
		console.error(err)
		if (isSqlUniqueViolation(err)) {
			throw new AppError(
				409,
				'Số điện thoại hoặc email đang được xử lý. Vui lòng không thao tác lặp lại!'
			)
		}
		throw err
	}
}

export async function updateGuestToCustomer(dto: UpdateGuestDto): Promise<void> {
	try {
		const rows = await executeQuery<{ user_id: string }>(
			`UPDATE users
			 SET password_hash = @passwordHash,
			     role = 'CUSTOMER',
			     full_name = @fullName
			 OUTPUT inserted.user_id
			 WHERE phone = @phone AND role = 'GUEST'`,
			{
				phone: { type: sql.VarChar(20), value: dto.phone },
				fullName: { type: sql.NVarChar(100), value: dto.fullName },
				passwordHash: { type: sql.VarChar(255), value: dto.passwordHash },
			}
		)

		if (rows.length === 0) {
			throw new AppError(
				409,
				'Số điện thoại hoặc email đang được xử lý. Vui lòng không thao tác lặp lại!'
			)
		}
	} catch (err: unknown) {
		if (err instanceof AppError) {
			throw err
		}
		if (isSqlUniqueViolation(err)) {
			throw new AppError(
				409,
				'Số điện thoại hoặc email đang được xử lý. Vui lòng không thao tác lặp lại!'
			)
		}
		throw err
	}
}

export const authRepository = {
	findByPhone,
	findUserById,
	createCustomer,
	updateGuestToCustomer,
}
