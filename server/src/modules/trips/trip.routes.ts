import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
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

// Public search endpoints
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

// Driver portal endpoint (must precede /:tripId to prevent collision)
router.get(
	'/driver',
	verifyJWT,
	checkRole(['DRIVER']),
	validateRequest({ query: driverTripsQuerySchema }),
	tripController.getDriverTrips.bind(tripController)
)

// Admin & Staff management endpoints
router.post(
	'/',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ body: createTripBodySchema }),
	tripController.createTrip.bind(tripController)
)

router.get(
	'/',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
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
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ params: tripIdParamsSchema, body: updateTripBodySchema }),
	tripController.updateTrip.bind(tripController)
)

router.post(
	'/:tripId/cancel',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ params: tripIdParamsSchema }),
	tripController.cancelTrip.bind(tripController)
)

router.patch(
	'/:tripId/status',
	verifyJWT,
	checkRole(['ADMIN', 'STAFF']),
	validateRequest({ params: tripIdParamsSchema, body: changeTripStatusBodySchema }),
	tripController.changeTripStatus.bind(tripController)
)

export default router



