import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ZodSchema } from 'zod'
import { AppError } from '../utils/app-error.js'

export function validateBody(schema: ZodSchema): RequestHandler {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body)
		if (!result.success) {
			const errorMessages = result.error.issues
				.map((issue) => issue.message)
				.join('; ')
			next(new AppError(400, errorMessages))
			return
		}

		req.body = result.data
		next()
	}
}
