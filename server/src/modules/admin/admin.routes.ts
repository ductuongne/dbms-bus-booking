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

// RBAC middleware: Yêu cầu quyền ADMIN cho toàn bộ các route quản trị
adminRouter.use(verifyJWT, checkRole(['ADMIN']))

// Danh sách người dùng hệ thống
adminRouter.get('/users', adminController.listUsers)

// Danh sách tài xế phục vụ phân công chuyến
adminRouter.get('/drivers', adminController.listDrivers)

// Tạo tài khoản người dùng mới
adminRouter.post(
	'/users',
	validateBody(createUserSchema),
	adminController.createUser
)

// Cập nhật thông tin người dùng
adminRouter.put(
	'/users/:id',
	validateBody(updateUserSchema),
	adminController.updateUser
)

// Cập nhật trạng thái người dùng (kích hoạt / vô hiệu hóa)
adminRouter.patch(
	'/users/:id/status',
	validateBody(updateUserStatusSchema),
	adminController.updateUserStatus
)
