import sql from 'mssql'
import { getPool } from '../config/db'
import { getCurrentDbUser } from './context.js'

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
			const pool = await getPool()
			const request = pool.request()
			const dbUser = getCurrentDbUser()

			if (!dbUser) {
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
			}

			// When dbUser is set: wrap dynamic call with EXECUTE AS USER & REVERT
			const outputParams: string[] = []
			const execParams: string[] = []
			const declarations: string[] = []

			for (const [key, param] of Object.entries(params)) {
				if (param.output) {
					outputParams.push(key)
					declarations.push(`DECLARE @out_${key} VARCHAR(100);`)
					execParams.push(`@${key} = @out_${key} OUTPUT`)
				} else {
					request.input(`in_${key}`, param.type, param.value)
					execParams.push(`@${key} = @in_${key}`)
				}
			}

			const selectOutputs = outputParams.length > 0
				? `SELECT ${outputParams.map((k) => `@out_${k} AS ${k}`).join(', ')};`
				: ''

			const batchSql = `
				EXECUTE AS USER = '${dbUser}';
				BEGIN TRY
					${declarations.join('\n')}
					EXEC ${procedureName} ${execParams.join(', ')};
					${selectOutputs}
					REVERT;
				END TRY
				BEGIN CATCH
					IF USER_NAME() <> 'dbo' REVERT;
					THROW;
				END CATCH
			`

			const result = await request.query(batchSql)

			const outputObj: Record<string, unknown> = {}
			let finalRecordsets = result.recordsets as unknown as T[][]

			if (outputParams.length > 0 && finalRecordsets.length > 0) {
				const lastRecordset = finalRecordsets[finalRecordsets.length - 1]
				if (lastRecordset && lastRecordset[0]) {
					const row = lastRecordset[0] as Record<string, unknown>
					let hasOutputKey = false
					for (const k of outputParams) {
						if (k in row) {
							outputObj[k] = row[k]
							hasOutputKey = true
						}
					}
					if (hasOutputKey) {
						finalRecordsets = finalRecordsets.slice(0, -1)
					}
				}
			}

			return {
				recordset: (finalRecordsets[0] ?? []) as T[],
				recordsets: finalRecordsets,
				output: outputObj,
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
	const pool = await getPool()
	const request = pool.request()

	for (const [key, param] of Object.entries(params)) {
		request.input(key, param.type, param.value)
	}

	const dbUser = getCurrentDbUser()
	let finalQuery = queryText

	if (dbUser) {
		finalQuery = `
			EXECUTE AS USER = '${dbUser}';
			BEGIN TRY
				${queryText};
				REVERT;
			END TRY
			BEGIN CATCH
				IF USER_NAME() <> 'dbo' REVERT;
				THROW;
			END CATCH
		`
	}

	const result = await request.query<T>(finalQuery)
	return result.recordset ?? []
}


