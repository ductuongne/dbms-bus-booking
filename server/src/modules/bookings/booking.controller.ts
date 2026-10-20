import type { NextFunction, Request, Response } from 'express'
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

	async getBookingByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { bookingCode } = bookingCodeParamsSchema.parse(req.params)
			const result = await bookingService.getBookingByCode(bookingCode)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getTripTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { tripId } = tripTicketsParamsSchema.parse(req.params)
			const query = tripTicketsQuerySchema.parse(req.query)
			const result = await bookingService.getTripTickets(tripId, query.status)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async checkInTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const body = checkInTicketBodySchema.parse(req.body)
			const result = await bookingService.checkInTicket(body.ticket_code)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}

export const bookingController = new BookingController()

