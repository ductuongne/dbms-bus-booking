import dotenv from 'dotenv'

dotenv.config()

function getRequiredEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`)
	}
	return value
}

export const env = {
	PORT: Number(process.env.PORT ?? 3000),
	CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
	DB_USER: getRequiredEnv('DB_USER'),
	DB_PASSWORD: getRequiredEnv('DB_PASSWORD'),
	DB_SERVER: getRequiredEnv('DB_SERVER'),
	DB_NAME: getRequiredEnv('DB_NAME'),
	DB_PORT: Number(process.env.DB_PORT ?? 1433),
	DB_ENCRYPT: process.env.DB_ENCRYPT === 'true',
	CRON_ENABLED: process.env.CRON_ENABLED !== 'false'
}

