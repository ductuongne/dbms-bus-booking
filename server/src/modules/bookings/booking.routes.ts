import { Router } from 'express'
import { bookingRateLimiter } from '../../middlewares/rate-limit'
import { validateRequest } from '../../middlewares/validate'
import { bookingController } from './booking.controller'
import {
	bookingIdParamsSchema,
	cancelBookingBodySchema,
	confirmBookingBodySchema,
	holdBookingBodySchema
} from './booking.schema'

const router = Router()

router.post(
	'/hold',
	bookingRateLimiter,
	validateRequest({ body: holdBookingBodySchema }),
	bookingController.holdBooking.bind(bookingController)
)

router.post(
	'/:bookingId/confirm',
	bookingRateLimiter,
	validateRequest({ params: bookingIdParamsSchema, body: confirmBookingBodySchema }),
	bookingController.confirmBooking.bind(bookingController)
)

router.post(
	'/:bookingId/cancel',
	bookingRateLimiter,
	validateRequest({ params: bookingIdParamsSchema, body: cancelBookingBodySchema }),
	bookingController.cancelBooking.bind(bookingController)
)

export default router

