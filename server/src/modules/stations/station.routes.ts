import { Router } from 'express'
import { stationController } from './station.controller'

// Public router for /api/stations
export const stationRouter = Router()

stationRouter.get('/', stationController.getAllStations.bind(stationController))
stationRouter.get('/:id', stationController.getStationDetail.bind(stationController))

// Public router for /api/provinces
export const provinceRouter = Router()
provinceRouter.get('/', stationController.getAllProvinces.bind(stationController))

// Admin router for /api/admin/stations
export const adminStationRouter = Router()

adminStationRouter.get('/', stationController.getAllStations.bind(stationController))
adminStationRouter.get('/:id', stationController.getStationDetail.bind(stationController))
adminStationRouter.post('/', stationController.createStation.bind(stationController))
adminStationRouter.put('/:id', stationController.updateStation.bind(stationController))
adminStationRouter.delete('/:id', stationController.deleteStation.bind(stationController))

export default stationRouter
