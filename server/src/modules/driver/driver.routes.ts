import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { driverController } from './driver.controller.js'

export const driverRouter = Router()

// RBAC middleware: Yêu cầu quyền DRIVER cho toàn bộ router phân hệ tài xế
driverRouter.use(verifyJWT, checkRole(['DRIVER']))

// Lịch trình được phân công của tài xế đang đăng nhập (gọi vw_LichPhanCongTaiXe)
driverRouter.get('/schedules', driverController.getMySchedule)

// Danh sách hành khách và trạng thái vé của chuyến xe
driverRouter.get('/trips/:tripId/passengers', driverController.getTripPassengers)

// Soát vé hành khách và cập nhật trạng thái CHECKED_IN (gọi sp_CheckIn)
driverRouter.post('/check-in', driverController.checkInTicket)

// Cập nhật trạng thái chuyến xe (DEPARTED: khởi hành, COMPLETED: hoàn thành - gọi sp_DoiTrangThaiChuyen)
driverRouter.patch('/trips/:tripId/status', driverController.updateTripStatus)
