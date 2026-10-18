import type { NextFunction, Request, Response } from 'express'
import { type ZodType, ZodError } from 'zod'
import { AppError } from './error-handler'

export interface RequestValidators {
	body?: ZodType
	query?: ZodType
	params?: ZodType
}

export function validateRequest(validators: RequestValidators) {
	return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
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
					.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
					.join('; ')
				next(new AppError(400, message))
				return
			}
			next(error)
		}
	}
}

