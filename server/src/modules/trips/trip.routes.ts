import { Router } from 'express'
import { validateRequest } from '../../middlewares/validate'
import { tripController } from './trip.controller'
import {
	adminTripsQuerySchema,
	changeTripStatusBodySchema,
	createTripBodySchema,
	driverTripsQuerySchema,
	searchTripsQuerySchema,
	tripIdParamsSchema,
	tripSeatsParamsSchema,
	updateTripBodySchema
} from './trip.schema'

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

// TODO(auth): authorize('ADMIN')
router.post(
	'/',
	validateRequest({ body: createTripBodySchema }),
	tripController.createTrip.bind(tripController)
)

router.get(
	'/',
	validateRequest({ query: adminTripsQuerySchema }),
	tripController.getAdminTrips.bind(tripController)
)

router.get(
	'/:tripId',
	validateRequest({ params: tripIdParamsSchema }),
	tripController.getTripDetail.bind(tripController)
)

router.put(
	'/:tripId',
	validateRequest({ params: tripIdParamsSchema, body: updateTripBodySchema }),
	tripController.updateTrip.bind(tripController)
)

router.post(
	'/:tripId/cancel',
	validateRequest({ params: tripIdParamsSchema }),
	tripController.cancelTrip.bind(tripController)
)

router.patch(
	'/:tripId/status',
	validateRequest({ params: tripIdParamsSchema, body: changeTripStatusBodySchema }),
	tripController.changeTripStatus.bind(tripController)
)

// TODO(auth): authorize('DRIVER')
router.get(
	'/driver',
	validateRequest({ query: driverTripsQuerySchema }),
	tripController.getDriverTrips.bind(tripController)
)

export default router


