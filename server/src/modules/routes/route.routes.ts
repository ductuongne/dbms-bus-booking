import { Router } from 'express'
import { routeController } from './route.controller'

// Public router for /api/routes
export const routeRouter = Router()

routeRouter.get('/', routeController.getAllRoutes.bind(routeController))
routeRouter.get('/:id', routeController.getRouteDetail.bind(routeController))

// Admin router for /api/admin/routes
export const adminRouteRouter = Router()

adminRouteRouter.get('/', routeController.getAllRoutes.bind(routeController))
adminRouteRouter.get('/:id', routeController.getRouteDetail.bind(routeController))
adminRouteRouter.post('/', routeController.createRoute.bind(routeController))
adminRouteRouter.put('/:id', routeController.updateRoute.bind(routeController))
adminRouteRouter.delete('/:id', routeController.deleteRoute.bind(routeController))

export default routeRouter
