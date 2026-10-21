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

// Trips & Bookings
appRouter.use('/trips', tripRoutes)
appRouter.use('/bookings', bookingRoutes)
appRouter.use('/payments', paymentRoutes)

// ==========================================
// PUBLIC USER ENDPOINTS (No authentication required)
// ==========================================
appRouter.use('/routes', routeRouter)
appRouter.use('/stations', stationRouter)
appRouter.use('/provinces', provinceRouter)
appRouter.use('/buses', busRouter)

// ==========================================
// ADMIN MANAGEMENT ENDPOINTS
// ==========================================

const adminRouter = Router()
adminRouter.use(verifyJWT)

// Operations management: Accessible by both ADMIN and STAFF
adminRouter.use('/buses', checkRole(['ADMIN', 'STAFF']), adminBusRouter)
adminRouter.use('/bus-types', checkRole(['ADMIN', 'STAFF']), adminBusTypeRouter)
adminRouter.use('/stations', checkRole(['ADMIN', 'STAFF']), adminStationRouter)
adminRouter.use('/routes', checkRole(['ADMIN', 'STAFF']), adminRouteRouter)

// Financial Reports: Restricted to ADMIN only (STAFF receives 403 Forbidden)
adminRouter.use('/reports', checkRole(['ADMIN']), reportRoutes)

appRouter.use('/admin', adminRouter)


export default appRouter
