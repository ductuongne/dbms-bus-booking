import { Router } from 'express'
import { validateBody } from '../../middlewares/validate.js'
import { registerSchema } from './auth.schema.js'
import { authController } from './auth.controller.js'

export const publicRouter = Router()

publicRouter.post(
	'/register',
	validateBody(registerSchema),
	authController.register
)
