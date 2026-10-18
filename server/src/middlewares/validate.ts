import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { type ZodType, type ZodSchema, ZodError } from 'zod'
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

export interface RequestValidators {
	body?: ZodType
	query?: ZodType
	params?: ZodType
}

export function validateRequest(validators: RequestValidators) {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			if (validators.params) {
				await validators.params.parseAsync(req.params)
			}
			if (validators.query) {
				await validators.query.parseAsync(req.query)
			}
			if (validators.body) {
				await validators.body.parseAsync(req.body)
			}
			next()
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				const message = error.issues
					.map(
						(issue) =>
							`${issue.path.join('.') || 'root'}: ${issue.message}`
					)
					.join('; ')
				next(new AppError(400, message))
				return
			}
			next(error)
		}
	}
}
