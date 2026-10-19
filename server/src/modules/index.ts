import { Router, type RequestHandler } from 'express'
import bookingRoutes from './bookings/booking.routes'
import paymentRoutes from './payments/payment.routes'
import tripRoutes from './trips/trip.routes'
import { busRouter, adminBusRouter, adminBusTypeRouter } from './buses/bus.routes'
import { stationRouter, provinceRouter, adminStationRouter } from './stations/station.routes'
import { routeRouter, adminRouteRouter } from './routes/route.routes'

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
// Placeholder middleware for Admin authorization.
// Currently bypassed as requested until Admin Login UI is integrated.
const adminAuthPlaceholder: RequestHandler = (_req, _res, next) => {
	// TODO: Replace with verifyJWT and checkRole(['ADMIN']) once Admin Auth UI is ready
	next()
}

const adminRouter = Router()
adminRouter.use(adminAuthPlaceholder)

adminRouter.use('/buses', adminBusRouter)
adminRouter.use('/bus-types', adminBusTypeRouter)
adminRouter.use('/stations', adminStationRouter)
adminRouter.use('/routes', adminRouteRouter)

appRouter.use('/admin', adminRouter)

export default appRouter
