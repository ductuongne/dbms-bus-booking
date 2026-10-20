import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { validateBody } from '../../middlewares/validate.js'
import { adminController } from './admin.controller.js'
import {
	createUserSchema,
	updateUserSchema,
	updateUserStatusSchema,
} from './admin.schema.js'

export const adminRouter = Router()

// BẢO VỆ TẦNG ROUTER (ROUTER-LEVEL RBAC GUARD):
// Áp dụng verifyJWT và checkRole(['ADMIN']) cho TOÀN BỘ routes của adminRouter
adminRouter.use(verifyJWT, checkRole(['ADMIN']))

// ENDPOINT 1: GET /users → List users
adminRouter.get('/users', adminController.listUsers)

// ENDPOINT: GET /drivers → List drivers for assignment
adminRouter.get('/drivers', adminController.listDrivers)

// ENDPOINT 2: POST /users → Create user
adminRouter.post(
	'/users',
	validateBody(createUserSchema),
	adminController.createUser
)

// ENDPOINT 3: PUT /users/:id → Update user info
adminRouter.put(
	'/users/:id',
	validateBody(updateUserSchema),
	adminController.updateUser
)

// ENDPOINT 4: PATCH /users/:id/status → Soft-delete / Toggle active status
adminRouter.patch(
	'/users/:id/status',
	validateBody(updateUserStatusSchema),
	adminController.updateUserStatus
)
