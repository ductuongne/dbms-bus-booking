import sql from 'mssql'
import { env } from './env.js'

const sqlConfig: sql.config = {
	user: env.DB_USER,
	password: env.DB_PASSWORD,
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

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
	if (!pool || !pool.connected) {
		pool = await sql.connect(sqlConfig)
	}
	return pool
}

export { sql }
