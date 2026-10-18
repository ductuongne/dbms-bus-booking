import { Router } from 'express'
import bookingRoutes from './bookings/booking.routes'
import tripRoutes from './trips/trip.routes'

const appRouter = Router()

appRouter.use('/trips', tripRoutes)
appRouter.use('/bookings', bookingRoutes)

export default appRouter


