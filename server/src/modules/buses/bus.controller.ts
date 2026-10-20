import type { NextFunction, Request, Response } from 'express'
import {
	busIdParamSchema,
	busTypeIdParamSchema,
	changeBusStatusSchema,
	createBusSchema,
	createBusTypeSchema,
	updateBusSchema,
	updateBusTypeSchema
} from './bus.schema'
import { busService } from './bus.service'

export class BusController {
	async getAllBuses(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const buses = await busService.getAllBuses()
			res.status(200).json(buses)
		} catch (error) {
			next(error)
		}
	}

	async getBusDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busIdParamSchema.parse(req.params)
			const bus = await busService.getBusById(id)
			res.status(200).json(bus)
		} catch (error) {
			next(error)
		}
	}

	async createBus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const input = createBusSchema.parse(req.body)
			const bus = await busService.createBus(input)
			res.status(201).json(bus)
		} catch (error) {
			next(error)
		}
	}

	async updateBus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busIdParamSchema.parse(req.params)
			const input = updateBusSchema.parse(req.body)
			const bus = await busService.updateBus(id, input)
			res.status(200).json(bus)
		} catch (error) {
			next(error)
		}
	}

	async changeBusStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busIdParamSchema.parse(req.params)
			const input = changeBusStatusSchema.parse(req.body)
			await busService.changeBusStatus(id, input)
			res.status(200).json({ message: 'Cập nhật trạng thái xe thành công' })
		} catch (error) {
			next(error)
		}
	}

	async deleteBus(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busIdParamSchema.parse(req.params)
			await busService.deleteBus(id)
			res.status(200).json({ message: 'Xóa hoặc ngừng hoạt động xe thành công' })
		} catch (error) {
			next(error)
		}
	}

	async getBusSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busIdParamSchema.parse(req.params)
			const seats = await busService.getSeatsByBusId(id)
			res.status(200).json(seats)
		} catch (error) {
			next(error)
		}
	}

	async getAllBusTypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const types = await busService.getAllBusTypes()
			res.status(200).json(types)
		} catch (error) {
			next(error)
		}
	}

	async getBusTypeDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busTypeIdParamSchema.parse(req.params)
			const type = await busService.getBusTypeById(id)
			res.status(200).json(type)
		} catch (error) {
			next(error)
		}
	}

	async createBusType(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const input = createBusTypeSchema.parse(req.body)
			const type = await busService.createBusType(input)
			res.status(201).json(type)
		} catch (error) {
			next(error)
		}
	}

	async updateBusType(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busTypeIdParamSchema.parse(req.params)
			const input = updateBusTypeSchema.parse(req.body)
			const type = await busService.updateBusType(id, input)
			res.status(200).json(type)
		} catch (error) {
			next(error)
		}
	}

	async deleteBusType(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = busTypeIdParamSchema.parse(req.params)
			await busService.deleteBusType(id)
			res.status(200).json({ message: 'Xóa loại xe thành công' })
		} catch (error) {
			next(error)
		}
	}
}

export const busController = new BusController()
