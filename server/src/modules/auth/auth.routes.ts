import { Router } from 'express'
import { validateBody } from '../../middlewares/validate.js'
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema.js'
import { authController } from './auth.controller.js'

export const publicRouter = Router()

publicRouter.post(
	'/register',
	validateBody(registerSchema),
	authController.register
)

publicRouter.post(
	'/login',
	validateBody(loginSchema),
	authController.login
)

publicRouter.post(
	'/refresh-token',
	validateBody(refreshTokenSchema),
	authController.refreshToken
)


