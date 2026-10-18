import type { NextFunction, Request, Response } from 'express'
import { searchTripsQuerySchema, tripSeatsParamsSchema } from './trip.schema'
import { tripService } from './trip.service'

export class TripController {
	async searchTrips(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const query = searchTripsQuerySchema.parse(req.query)
			const result = await tripService.searchTrips(query)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getTripSeats(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { tripId } = tripSeatsParamsSchema.parse(req.params)
			const result = await tripService.getTripSeats(tripId)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}


export const tripController = new TripController()


