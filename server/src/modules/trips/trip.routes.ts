import { Router } from 'express'
import { validateRequest } from '../../middlewares/validate'
import { tripController } from './trip.controller'
import { searchTripsQuerySchema, tripSeatsParamsSchema } from './trip.schema'

const router = Router()

router.get(
	'/search',
	validateRequest({ query: searchTripsQuerySchema }),
	tripController.searchTrips.bind(tripController)
)

router.get(
	'/:tripId/seats',
	validateRequest({ params: tripSeatsParamsSchema }),
	tripController.getTripSeats.bind(tripController)
)

export default router


