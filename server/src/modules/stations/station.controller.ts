import type { NextFunction, Request, Response } from 'express'
import {
	createStationSchema,
	stationIdParamSchema,
	updateStationSchema
} from './station.schema'
import { stationService } from './station.service'

export class StationController {
	async getAllStations(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const provinceId = typeof req.query.provinceId === 'string' ? req.query.provinceId : undefined
			const stations = await stationService.getAllStations(provinceId)
			res.status(200).json(stations)
		} catch (error) {
			next(error)
		}
	}

	async getStationDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = stationIdParamSchema.parse(req.params)
			const station = await stationService.getStationById(id)
			res.status(200).json(station)
		} catch (error) {
			next(error)
		}
	}

	async createStation(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const input = createStationSchema.parse(req.body)
			const station = await stationService.createStation(input)
			res.status(201).json(station)
		} catch (error) {
			next(error)
		}
	}

	async updateStation(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = stationIdParamSchema.parse(req.params)
			const input = updateStationSchema.parse(req.body)
			const station = await stationService.updateStation(id, input)
			res.status(200).json(station)
		} catch (error) {
			next(error)
		}
	}

	async deleteStation(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = stationIdParamSchema.parse(req.params)
			await stationService.deleteStation(id)
			res.status(200).json({ message: 'Xóa bến xe thành công' })
		} catch (error) {
			next(error)
		}
	}

	async getAllProvinces(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const provinces = await stationService.getAllProvinces()
			res.status(200).json(provinces)
		} catch (error) {
			next(error)
		}
	}
}

export const stationController = new StationController()
