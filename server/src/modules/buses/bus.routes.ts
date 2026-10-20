import { Router } from 'express'
import { busController } from './bus.controller'

// Public router for /api/buses
export const busRouter = Router()

busRouter.get('/:id', busController.getBusDetail.bind(busController))
busRouter.get('/:id/seats', busController.getBusSeats.bind(busController))

// Admin router for /api/admin/buses
export const adminBusRouter = Router()

adminBusRouter.get('/', busController.getAllBuses.bind(busController))
adminBusRouter.get('/:id', busController.getBusDetail.bind(busController))
adminBusRouter.post('/', busController.createBus.bind(busController))
adminBusRouter.put('/:id', busController.updateBus.bind(busController))
adminBusRouter.patch('/:id/status', busController.changeBusStatus.bind(busController))
adminBusRouter.delete('/:id', busController.deleteBus.bind(busController))

// Admin router for /api/admin/bus-types
export const adminBusTypeRouter = Router()

adminBusTypeRouter.get('/', busController.getAllBusTypes.bind(busController))
adminBusTypeRouter.get('/:id', busController.getBusTypeDetail.bind(busController))
adminBusTypeRouter.post('/', busController.createBusType.bind(busController))
adminBusTypeRouter.put('/:id', busController.updateBusType.bind(busController))
adminBusTypeRouter.delete('/:id', busController.deleteBusType.bind(busController))

export default busRouter
