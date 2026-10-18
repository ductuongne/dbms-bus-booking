import { Router } from 'express'
import tripRoutes from './trips/trip.routes'

const appRouter = Router()

appRouter.use('/trips', tripRoutes)

export default appRouter


