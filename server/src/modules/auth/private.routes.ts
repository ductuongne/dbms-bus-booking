import { Router } from 'express'
import { authController } from './auth.controller.js'

export const privateRouter = Router()

privateRouter.get('/me', authController.me)
