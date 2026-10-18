import { Router } from 'express'
import { bookingRateLimiter } from '../../middlewares/rate-limit'
import { validateRequest } from '../../middlewares/validate'
import { paymentController } from './payment.controller'
import {
	lookupPaymentParamsSchema,
	lookupPaymentQuerySchema,
	payBookingBodySchema,
	payBookingParamsSchema
} from './payment.schema'

const router = Router()

router.post(
	'/:bookingId/pay',
	bookingRateLimiter,
	validateRequest({ params: payBookingParamsSchema, body: payBookingBodySchema }),
	paymentController.payBooking.bind(paymentController)
)

router.get(
	'/lookup/:bookingCode',
	validateRequest({ params: lookupPaymentParamsSchema, query: lookupPaymentQuerySchema }),
	paymentController.lookupPayments.bind(paymentController)
)

export default router
