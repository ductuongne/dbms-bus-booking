import sql from 'mssql'
import { env } from './env.js'

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
	if (pool && pool.connected) {
		return pool
	}

	const config: sql.config = {
		server: env.db.server,
		database: env.db.database,
		user: env.db.user,
		password: env.db.password,
		port: env.db.port,
		options: {
			encrypt: env.db.encrypt,
			trustServerCertificate: true,
		},
	}

	pool = await new sql.ConnectionPool(config).connect()
	return pool
}

export { sql }
