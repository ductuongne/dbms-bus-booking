import dotenv from 'dotenv'

dotenv.config()

interface DatabaseConfig {
	server: string
	database: string
	user: string
	password: string
	port: number
	encrypt: boolean
}

export interface EnvConfig {
	PORT: number
	port: number
	jwtSecret: string
	jwtRefreshSecret: string
	jwtAccessExpiresIn: string
	jwtRefreshExpiresIn: string
	CLIENT_URL: string
	clientUrl: string
	DB_USER: string
	DB_PASSWORD: string
	DB_SERVER: string
	DB_NAME: string
	DB_PORT: number
	DB_ENCRYPT: boolean
	CRON_ENABLED: boolean
	db: DatabaseConfig
	dbAdminUser: string
	dbAdminPassword: string
	dbStaffUser: string
	dbStaffPassword: string
	dbDriverUser: string
	dbDriverPassword: string
	dbCustomerUser: string
	dbCustomerPassword: string
}

function getRequiredEnv(name: string): string {
	const value = process.env[name]
	if (!value || value.trim() === '') {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value
}

const dbUser = getRequiredEnv('DB_USER')
const dbPassword = getRequiredEnv('DB_PASSWORD')
const dbServer = getRequiredEnv('DB_SERVER')
const dbName = getRequiredEnv('DB_NAME')
const dbPort = Number(process.env.DB_PORT ?? 1433)
const dbEncrypt = process.env.DB_ENCRYPT === 'true'
const port = Number(process.env.PORT ?? 3000)
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'

export const env: EnvConfig = {
	PORT: port,
	port: port,
	jwtSecret: process.env.JWT_SECRET ?? 'jwt_bus_booking_super_secret_key',
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'jwt_bus_booking_refresh_super_secret_key',
	jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
	jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
	CLIENT_URL: clientUrl,
	clientUrl: clientUrl,
	DB_USER: dbUser,
	DB_PASSWORD: dbPassword,
	DB_SERVER: dbServer,
	DB_NAME: dbName,
	DB_PORT: dbPort,
	DB_ENCRYPT: dbEncrypt,
	CRON_ENABLED: process.env.CRON_ENABLED !== 'false',
	db: {
		server: dbServer,
		database: dbName,
		user: dbUser,
		password: dbPassword,
		port: dbPort,
		encrypt: dbEncrypt,
	},
	dbAdminUser: process.env.DB_ADMIN_USER ?? 'login_admin',
	dbAdminPassword: process.env.DB_ADMIN_PASSWORD ?? 'AdminStrongPassword@2026',
	dbStaffUser: process.env.DB_STAFF_USER ?? 'login_nhanvien',
	dbStaffPassword: process.env.DB_STAFF_PASSWORD ?? 'StaffStrongPassword@2026',
	dbDriverUser: process.env.DB_DRIVER_USER ?? 'login_taixe',
	dbDriverPassword: process.env.DB_DRIVER_PASSWORD ?? 'DriverStrongPassword@2026',
	dbCustomerUser: process.env.DB_CUSTOMER_USER ?? 'login_khachhang',
	dbCustomerPassword: process.env.DB_CUSTOMER_PASSWORD ?? 'CustomerStrongPassword@2026',
}
