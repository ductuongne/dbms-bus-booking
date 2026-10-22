import { Router, type RequestHandler } from 'express'
import bookingRoutes from './bookings/booking.routes'
import paymentRoutes from './payments/payment.routes'
import tripRoutes from './trips/trip.routes'
import { busRouter, adminBusRouter, adminBusTypeRouter } from './buses/bus.routes'
import { stationRouter, provinceRouter, adminStationRouter } from './stations/station.routes'
import { routeRouter, adminRouteRouter } from './routes/route.routes'
import reportRoutes from './reports/report.routes'
import { verifyJWT, checkRole } from '../middlewares/auth.middleware.js'
const appRouter = Router()

// Nghiệp vụ Chuyến đi, Đặt vé và Thanh toán
appRouter.use('/trips', tripRoutes)
appRouter.use('/bookings', bookingRoutes)
appRouter.use('/payments', paymentRoutes)

// Public endpoints (tra cứu tuyến đường, bến xe, tỉnh thành, phương tiện)
appRouter.use('/routes', routeRouter)
appRouter.use('/stations', stationRouter)
appRouter.use('/provinces', provinceRouter)
appRouter.use('/buses', busRouter)

// Quản trị vận hành & Báo cáo (yêu cầu xác thực JWT)
const adminRouter = Router()
adminRouter.use(verifyJWT)

// Quản lý xe, loại xe, bến xe, tuyến đường: Phân quyền cho ADMIN và STAFF
adminRouter.use('/buses', checkRole(['ADMIN', 'STAFF']), adminBusRouter)
adminRouter.use('/bus-types', checkRole(['ADMIN', 'STAFF']), adminBusTypeRouter)
adminRouter.use('/stations', checkRole(['ADMIN', 'STAFF']), adminStationRouter)
adminRouter.use('/routes', checkRole(['ADMIN', 'STAFF']), adminRouteRouter)

// Báo cáo doanh thu tài chính: Giới hạn riêng cho quyền ADMIN
adminRouter.use('/reports', checkRole(['ADMIN']), reportRoutes)

appRouter.use('/admin', adminRouter)


export default appRouter
