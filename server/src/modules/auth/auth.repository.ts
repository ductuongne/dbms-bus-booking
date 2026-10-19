import { getPool, sql } from '../../config/db.js'
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
	const pool = await getPool()
	const request = pool.request()
	request.input('phone', sql.VarChar(20), phone)

	const result = await request.query<UserRow>(
		`SELECT user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active
		 FROM users
		 WHERE phone = @phone`
	)

	const row = result.recordset[0]
	if (!row) {
		return null
	}
	return row
}

export async function findUserById(userId: string): Promise<UserRow | null> {
	const pool = await getPool()
	const request = pool.request()
	request.input('userId', sql.VarChar(50), userId)

	const result = await request.query<UserRow>(
		`SELECT user_id, full_name, email, phone, password_hash, role, loyalty_points, is_active
		 FROM users
		 WHERE user_id = @userId`
	)

	const row = result.recordset[0]
	return row ?? null
}

export async function createCustomer(dto: CreateCustomerDto): Promise<void> {
	const pool = await getPool()
	const request = pool.request()

	request.input('userId', sql.VarChar(50), dto.userId)
	request.input('fullName', sql.NVarChar(100), dto.fullName)
	request.input('phone', sql.VarChar(20), dto.phone)
	request.input('email', sql.VarChar(100), dto.email)
	request.input('passwordHash', sql.VarChar(255), dto.passwordHash)

	try {
		await request.query(
			`INSERT INTO users (user_id, full_name, phone, email, password_hash, role, loyalty_points, is_active)
			 VALUES (@userId, @fullName, @phone, @email, @passwordHash, 'CUSTOMER', 0, 1)`
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
	const pool = await getPool()
	const request = pool.request()

	request.input('phone', sql.VarChar(20), dto.phone)
	request.input('fullName', sql.NVarChar(100), dto.fullName)
	request.input('passwordHash', sql.VarChar(255), dto.passwordHash)

	try {
		const result = await request.query(
			`UPDATE users
			 SET password_hash = @passwordHash,
			     role = 'CUSTOMER',
			     full_name = @fullName
			 WHERE phone = @phone AND role = 'GUEST'`
		)

		const affected = result.rowsAffected[0]
		if (affected === undefined || affected === 0) {
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
