import type { NextFunction, Request, Response } from 'express'
import {
	createRouteSchema,
	routeIdParamSchema,
	updateRouteSchema
} from './route.schema'
import { routeService } from './route.service'

export class RouteController {
	async getAllRoutes(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const routes = await routeService.getAllRoutes()
			res.status(200).json(routes)
		} catch (error) {
			next(error)
		}
	}

	async getRouteDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = routeIdParamSchema.parse(req.params)
			const route = await routeService.getRouteById(id)
			res.status(200).json(route)
		} catch (error) {
			next(error)
		}
	}

	async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const input = createRouteSchema.parse(req.body)
			const route = await routeService.createRoute(input)
			res.status(201).json(route)
		} catch (error) {
			next(error)
		}
	}

	async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = routeIdParamSchema.parse(req.params)
			const input = updateRouteSchema.parse(req.body)
			const route = await routeService.updateRoute(id, input)
			res.status(200).json(route)
		} catch (error) {
			next(error)
		}
	}

	async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = routeIdParamSchema.parse(req.params)
			await routeService.deleteRoute(id)
			res.status(200).json({ message: 'Xóa tuyến đường thành công' })
		} catch (error) {
			next(error)
		}
	}
}

export const routeController = new RouteController()
