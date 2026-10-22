import '../polyfills.js'
import sql from 'mssql'
import { env } from './env.js'
import type { UserRole } from '../types/index.js'
import { securityContext } from '../database/context.js'

export const DB_ROLE_CREDENTIALS: Record<UserRole | 'DEFAULT', { user: string; password: string }> = {
	ADMIN: { user: 'login_admin', password: 'AdminStrongPassword@2026' },
	STAFF: { user: 'login_nhanvien', password: 'StaffStrongPassword@2026' },
	DRIVER: { user: 'login_taixe', password: 'DriverStrongPassword@2026' },
	CUSTOMER: { user: 'login_khachhang', password: 'CustomerStrongPassword@2026' },
	GUEST: { user: 'login_khachhang', password: 'CustomerStrongPassword@2026' },
	DEFAULT: { user: env.DB_USER || 'bus_admin', password: env.DB_PASSWORD || 'BusBooking@2026' },
}

const poolMap = new Map<string, sql.ConnectionPool>()

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

