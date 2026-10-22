import sql from 'mssql'
import { getPool } from '../config/db'

export interface QueryParam {
	type: sql.ISqlType | (() => sql.ISqlType)
	value: unknown
	output?: boolean
}

export interface SPExecutionResult<T = Record<string, unknown>> {
	recordset: T[]
	recordsets: T[][]
	output: Record<string, unknown>
	rowsAffected: number[]
}

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

function isSqlError(error: unknown): error is { number: number } {
	return typeof error === 'object' && error !== null && 'number' in error && typeof error.number === 'number'
}

export async function executeSP<T = Record<string, unknown>>(
	procedureName: string,
	params: Record<string, QueryParam> = {}
): Promise<SPExecutionResult<T>> {
	const maxRetries = 3

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			// getPool() tự động trả về Connection Pool tương ứng với Role của request hiện tại
			const pool = await getPool()
			const request = pool.request()

			for (const [key, param] of Object.entries(params)) {
				if (param.output) {
					request.output(key, param.type, param.value)
				} else {
					request.input(key, param.type, param.value)
				}
			}

			const result = await request.execute<T>(procedureName)
			return {
				recordset: result.recordset ?? [],
				recordsets: result.recordsets ?? [],
				output: result.output ?? {},
				rowsAffected: result.rowsAffected ?? []
			}
		} catch (error: unknown) {
			const isDeadlock = isSqlError(error) && error.number === 1205

			if (isDeadlock && attempt < maxRetries) {
				const backoffMs = 100 * (attempt + 1)
				console.warn(
					`[Deadlock 1205] Retrying ${procedureName} (attempt ${attempt + 1}/${maxRetries}) in ${backoffMs}ms...`
				)
				await sleep(backoffMs)
				continue
			}
			throw error
		}
	}

	throw new Error(`Execution of ${procedureName} failed after ${maxRetries} deadlock retries.`)
}

export async function executeQuery<T = Record<string, unknown>>(
	queryText: string,
	params: Record<string, QueryParam> = {}
): Promise<T[]> {
	// getPool() tự động trả về Connection Pool tương ứng với Role của request hiện tại
	const pool = await getPool()
	const request = pool.request()

	for (const [key, param] of Object.entries(params)) {
		request.input(key, param.type, param.value)
	}

	const result = await request.query<T>(queryText)
	return result.recordset ?? []
}
