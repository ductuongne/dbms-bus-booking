export class AppError extends Error {
	public readonly statusCode: number
	public readonly isOperational: boolean

	constructor(statusCode: number, message: string, isOperational = true) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = isOperational
		this.name = 'AppError'

		Object.setPrototypeOf(this, new.target.prototype)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}
