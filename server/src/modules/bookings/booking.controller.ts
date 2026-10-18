import type { NextFunction, Request, Response } from 'express'
import {
	bookingIdParamsSchema,
	cancelBookingBodySchema,
	confirmBookingBodySchema,
	holdBookingBodySchema
} from './booking.schema'
import { bookingService } from './booking.service'

export class BookingController {
	async holdBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const body = holdBookingBodySchema.parse(req.body)
			const result = await bookingService.holdBooking(body)
			res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	}

	async confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { bookingId } = bookingIdParamsSchema.parse(req.params)
			const body = confirmBookingBodySchema.parse(req.body)
			const result = await bookingService.confirmBooking(bookingId, body)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { bookingId } = bookingIdParamsSchema.parse(req.params)
			const body = cancelBookingBodySchema.parse(req.body)
			const result = await bookingService.cancelBooking(bookingId, body)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}

export const bookingController = new BookingController()

