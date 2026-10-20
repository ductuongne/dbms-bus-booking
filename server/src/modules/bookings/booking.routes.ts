import { Router } from 'express'
import { checkRole, verifyJWT } from '../../middlewares/auth.middleware.js'
import { bookingRateLimiter } from '../../middlewares/rate-limit'
import { validateRequest } from '../../middlewares/validate'
import { bookingController } from './booking.controller'
import {
	bookingCodeParamsSchema,
	bookingIdParamsSchema,
	cancelBookingBodySchema,
	checkInTicketBodySchema,
	confirmBookingBodySchema,
	holdBookingBodySchema,
	tripTicketsParamsSchema,
	tripTicketsQuerySchema
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

// Tra cứu thông tin vé và booking (công khai cho hành khách tra cứu qua mã đơn)
router.get(
	'/lookup/:bookingCode',
	validateRequest({ params: bookingCodeParamsSchema }),
	bookingController.getBookingByCode.bind(bookingController)
)

router.get(
	'/trips/:tripId/tickets',
	verifyJWT,
	checkRole(['STAFF', 'ADMIN', 'DRIVER']),
	validateRequest({ params: tripTicketsParamsSchema, query: tripTicketsQuerySchema }),
	bookingController.getTripTickets.bind(bookingController)
)

router.post(
	'/check-in',
	verifyJWT,
	checkRole(['STAFF', 'ADMIN', 'DRIVER']),
	validateRequest({ body: checkInTicketBodySchema }),
	bookingController.checkInTicket.bind(bookingController)
)

export default router


