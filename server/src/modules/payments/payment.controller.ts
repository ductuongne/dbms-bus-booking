import type { NextFunction, Request, Response } from 'express'
import {
	lookupPaymentParamsSchema,
	lookupPaymentQuerySchema,
	payBookingBodySchema,
	payBookingParamsSchema
} from './payment.schema'
import { paymentService } from './payment.service'

export class PaymentController {
	async payBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { bookingId } = payBookingParamsSchema.parse(req.params)
			const body = payBookingBodySchema.parse(req.body)
			const result = await paymentService.payBooking(bookingId, body)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async lookupPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { bookingCode } = lookupPaymentParamsSchema.parse(req.params)
			const { phone } = lookupPaymentQuerySchema.parse(req.query)
			const result = await paymentService.lookupPayments(bookingCode, phone)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}

export const paymentController = new PaymentController()
