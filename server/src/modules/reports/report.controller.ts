import type { NextFunction, Request, Response } from 'express'
import { reportRangeQuerySchema, revenueReportQuerySchema } from './report.schema'
import { reportService } from './report.service'

export class ReportController {
	async getRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const query = revenueReportQuerySchema.parse(req.query)
			const result = await reportService.getRevenueReport(query)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getRouteRevenueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const query = reportRangeQuerySchema.parse(req.query)
			const result = await reportService.getRouteRevenueReport(query)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}

	async getOccupancyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const query = reportRangeQuerySchema.parse(req.query)
			const result = await reportService.getOccupancyReport(query)
			res.status(200).json(result)
		} catch (error) {
			next(error)
		}
	}
}

export const reportController = new ReportController()
