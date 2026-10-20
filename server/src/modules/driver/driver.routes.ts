import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { driverController } from './driver.controller.js'

export const driverRouter = Router()

// BẢO VỆ TOÀN BỘ ROUTER BẰNG VERIFY_JWT VÀ CHECK_ROLE(['DRIVER'])
driverRouter.use(verifyJWT, checkRole(['DRIVER']))

// GET /api/private/driver/schedules → Lấy lịch trình của tài xế đang đăng nhập
driverRouter.get('/schedules', driverController.getMySchedule)

// GET /api/private/driver/trips/:tripId/passengers → Lấy danh sách hành khách của chuyến
driverRouter.get('/trips/:tripId/passengers', driverController.getTripPassengers)

// POST /api/private/driver/check-in → Soát vé hành khách
driverRouter.post('/check-in', driverController.checkInTicket)

// PATCH /api/private/driver/trips/:tripId/status → Chuyển trạng thái chuyến (DEPARTED, COMPLETED)
driverRouter.patch('/trips/:tripId/status', driverController.updateTripStatus)
