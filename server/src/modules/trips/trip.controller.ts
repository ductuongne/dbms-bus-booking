import type { NextFunction, Request, Response } from 'express'
import {
	adminTripsQuerySchema,
	changeTripStatusBodySchema,
	createTripBodySchema,
	driverTripsQuerySchema,
	searchTripsQuerySchema,
	tripSeatsParamsSchema,
	updateTripBodySchema
} from './trip.schema'
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
	async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const body = createTripBodySchema.parse(req.body)
			const result = await tripService.createTrip(body)
			res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getAdminTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const query = adminTripsQuerySchema.parse(req.query)
			const result = await tripService.getAdminTrips(query)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getTripDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { tripId } = tripSeatsParamsSchema.parse(req.params)
			const result = await tripService.getTripDetail(tripId)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async updateTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { tripId } = tripSeatsParamsSchema.parse(req.params)
			const body = updateTripBodySchema.parse(req.body)
			const result = await tripService.updateTrip(tripId, body)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async cancelTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { tripId } = tripSeatsParamsSchema.parse(req.params)
			const result = await tripService.cancelTrip(tripId)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async changeTripStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { tripId } = tripSeatsParamsSchema.parse(req.params)
			const body = changeTripStatusBodySchema.parse(req.body)
			const result = await tripService.changeTripStatus(tripId, body.status)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getDriverTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const query = driverTripsQuerySchema.parse(req.query)
			const result = await tripService.getDriverTrips(query.userId, query.date)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}


}

export const tripController = new TripController()


