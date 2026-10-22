import '../polyfills.js'
import sql from 'mssql'
import { env } from './env.js'
import type { UserRole } from '../types/index.js'
import { securityContext } from '../database/context.js'

/**
 * Cấu hình thông tin xác thực SQL Server theo vai trò (Role-Based Logins)
 * Tuân thủ nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege)
 */
export const DB_ROLE_CREDENTIALS: Record<UserRole | 'DEFAULT', { user: string; password: string }> = {
	ADMIN: { user: env.dbAdminUser, password: env.dbAdminPassword },
	STAFF: { user: env.dbStaffUser, password: env.dbStaffPassword },
	DRIVER: { user: env.dbDriverUser, password: env.dbDriverPassword },
	CUSTOMER: { user: env.dbCustomerUser, password: env.dbCustomerPassword },
	GUEST: { user: env.dbCustomerUser, password: env.dbCustomerPassword },
	DEFAULT: { user: env.DB_USER, password: env.DB_PASSWORD },
}

// Bộ nhớ đệm quản lý Connection Pool cho từng tài khoản SQL Server
const poolMap = new Map<string, sql.ConnectionPool>()

/**
 * Lấy hoặc tạo mới Connection Pool tương ứng với vai trò của request hiện tại
 */
export async function getPool(role?: UserRole): Promise<sql.ConnectionPool> {
	const currentRole = role || securityContext.getStore()?.role || 'DEFAULT'
	const creds = DB_ROLE_CREDENTIALS[currentRole] || DB_ROLE_CREDENTIALS.DEFAULT
	const poolKey = creds.user

	let pool = poolMap.get(poolKey)
	if (!pool || !pool.connected) {
		const config: sql.config = {
			user: creds.user,
			password: creds.password,
			server: env.DB_SERVER,
			database: env.DB_NAME,
			port: env.DB_PORT,
			options: {
				encrypt: env.DB_ENCRYPT,
				trustServerCertificate: true,
				useUTC: false,
			},
			pool: {
				max: 10,
				min: 0,
				idleTimeoutMillis: 30000,
			},
		}
		pool = await sql.connect(config)
		poolMap.set(poolKey, pool)
	}

	return pool
}

export { sql }

