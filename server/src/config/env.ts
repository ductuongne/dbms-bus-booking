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

interface EnvConfig {
	port: number
	jwtSecret: string
	clientUrl: string
	db: DatabaseConfig
}

function getRequiredEnv(key: string): string {
	const value = process.env[key]
	if (!value || value.trim() === '') {
		throw new Error(`Missing env var: ${key}`)
	}
	return value
}

export const env: EnvConfig = {
	port: Number(process.env.PORT ?? 3000),
	jwtSecret: getRequiredEnv('JWT_SECRET'),
	clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
	db: {
		server: getRequiredEnv('DB_SERVER'),
		database: getRequiredEnv('DB_NAME'),
		user: getRequiredEnv('DB_USER'),
		password: getRequiredEnv('DB_PASSWORD'),
		port: Number(process.env.DB_PORT ?? 1433),
		encrypt: process.env.DB_ENCRYPT === 'true',
	},
}
