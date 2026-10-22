import { sql } from '../../config/db.js'
import { executeQuery, executeSP } from '../../database/query.js'
import type { CreateCustomerDto, UpdateGuestDto, UserRow } from '../../types/index.js'

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
	await executeSP('dbo.sp_DangKyKhachHang', {
		user_id: { type: sql.VarChar(50), value: dto.userId },
		full_name: { type: sql.NVarChar(100), value: dto.fullName },
		email: { type: sql.VarChar(100), value: dto.email },
		phone: { type: sql.VarChar(20), value: dto.phone },
		password_hash: { type: sql.VarChar(255), value: dto.passwordHash },
	})
}

export async function updateGuestToCustomer(dto: UpdateGuestDto): Promise<void> {
	await executeSP('dbo.sp_CapNhatGuestThanhKhachHang', {
		phone: { type: sql.VarChar(20), value: dto.phone },
		full_name: { type: sql.NVarChar(100), value: dto.fullName },
		password_hash: { type: sql.VarChar(255), value: dto.passwordHash },
	})
}

export const authRepository = {
	findByPhone,
	findUserById,
	createCustomer,
	updateGuestToCustomer,
}
