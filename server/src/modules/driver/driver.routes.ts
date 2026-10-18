import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { driverController } from './driver.controller.js'

export const driverRouter = Router()

// BẢO VỆ TOÀN BỘ ROUTER BẰNG VERIFY_JWT VÀ CHECK_ROLE(['DRIVER'])
driverRouter.use(verifyJWT, checkRole(['DRIVER']))

// GET /api/private/driver/schedules → Lấy lịch trình của tài xế đang đăng nhập
driverRouter.get('/schedules', driverController.getMySchedule)
