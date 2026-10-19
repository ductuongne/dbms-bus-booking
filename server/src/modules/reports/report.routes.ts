import { Router } from 'express'
import { validateRequest } from '../../middlewares/validate'
import { reportController } from './report.controller'
import { reportRangeQuerySchema, revenueReportQuerySchema } from './report.schema'

const router = Router()

router.get(
	'/revenue',
	validateRequest({ query: revenueReportQuerySchema }),
	reportController.getRevenueReport.bind(reportController)
)

router.get(
	'/routes',
	validateRequest({ query: reportRangeQuerySchema }),
	reportController.getRouteRevenueReport.bind(reportController)
)

router.get(
	'/occupancy',
	validateRequest({ query: reportRangeQuerySchema }),
	reportController.getOccupancyReport.bind(reportController)
)

export default router
