import { sql } from '../../config/db.js'
import { executeQuery, executeSP } from '../../database/query.js'
import type {
	AdminUserResponseDto,
	CreateAdminUserData,
	UpdateAdminUserData,
} from '../../types/index.js'
import { AppError } from '../../utils/app-error.js'

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
	await executeSP('dbo.sp_TaoNguoiDung', {
		user_id: { type: sql.VarChar(50), value: data.userId },
		full_name: { type: sql.NVarChar(100), value: data.fullName },
		email: { type: sql.VarChar(100), value: data.email },
		phone: { type: sql.VarChar(20), value: data.phone },
		password_hash: { type: sql.VarChar(255), value: data.passwordHash },
		role: { type: sql.VarChar(20), value: data.role },
		license_number: { type: sql.VarChar(50), value: null },
		license_expiry: { type: sql.Date, value: null },
	})
}

export async function update(
	userId: string,
	data: UpdateAdminUserData
): Promise<void> {
	await executeSP('dbo.sp_CapNhatNguoiDung', {
		user_id: { type: sql.VarChar(50), value: userId },
		full_name: { type: sql.NVarChar(100), value: data.fullName },
		email: { type: sql.VarChar(100), value: data.email },
		phone: { type: sql.VarChar(20), value: data.phone },
		role: { type: sql.VarChar(20), value: data.role },
	})
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

export async function listDrivers(): Promise<
	{
		driverId: string
		userId: string
		fullName: string
		phone: string
		licenseNumber: string
	}[]
> {
	return executeQuery(
		`SELECT d.driver_id AS driverId,
		        d.user_id AS userId,
		        u.full_name AS fullName,
		        u.phone,
		        d.license_number AS licenseNumber
		 FROM drivers d
		 JOIN users u ON u.user_id = d.user_id
		 WHERE u.is_active = 1
		 ORDER BY u.full_name ASC`
	)
}

export const adminRepository = {
	findAll,
	findById,
	create,
	update,
	updateStatus,
	listDrivers,
}
