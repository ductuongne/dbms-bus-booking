import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/app-error.js'

export const errorHandler: ErrorRequestHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	if (err instanceof AppError && err.isOperational) {
		res.status(err.statusCode).json({
			success: false,
			message: err.message,
		})
		return
	}

	console.error('[UnhandledError]', err)
	res.status(500).json({
		success: false,
		message: 'Lỗi máy chủ nội bộ.',
	})
}
