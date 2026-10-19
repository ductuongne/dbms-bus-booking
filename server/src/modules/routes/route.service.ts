import { AppError } from '../../utils/app-error'
import {
	type CreateRouteInput,
	type UpdateRouteInput
} from './route.schema'
import { routeRepository } from './route.repository'

export interface RouteDto {
	id: string
	departureStationId: string
	departureStationName: string
	departureProvinceId: string
	departureProvince: string
	arrivalStationId: string
	arrivalStationName: string
	arrivalProvinceId: string
	arrivalProvince: string
	distanceKm: number
	estimatedDuration: number
}

export interface RouteStopDto {
	id: string
	routeId: string
	stationId: string
	stationName: string
	address: string
	provinceName: string
	stopOrder: number
}

export interface RouteDetailDto extends RouteDto {
	stops: RouteStopDto[]
}

export class RouteService {
	async getAllRoutes(): Promise<RouteDto[]> {
		const rows = await routeRepository.getAllRoutes()
		return rows.map((r) => ({
			id: r.route_id,
			departureStationId: r.departure_station_id,
			departureStationName: r.departure_station_name,
			departureProvinceId: r.departure_province_id,
			departureProvince: r.departure_province,
			arrivalStationId: r.arrival_station_id,
			arrivalStationName: r.arrival_station_name,
			arrivalProvinceId: r.arrival_province_id,
			arrivalProvince: r.arrival_province,
			distanceKm: r.distance_km,
			estimatedDuration: r.estimated_duration
		}))
	}

	async getRouteById(routeId: string): Promise<RouteDetailDto> {
		const { route, stops } = await routeRepository.getRouteById(routeId)
		if (!route) {
			throw new AppError(404, 'Không tìm thấy tuyến đường')
		}
		return {
			id: route.route_id,
			departureStationId: route.departure_station_id,
			departureStationName: route.departure_station_name,
			departureProvinceId: route.departure_province_id,
			departureProvince: route.departure_province,
			arrivalStationId: route.arrival_station_id,
			arrivalStationName: route.arrival_station_name,
			arrivalProvinceId: route.arrival_province_id,
			arrivalProvince: route.arrival_province,
			distanceKm: route.distance_km,
			estimatedDuration: route.estimated_duration,
			stops: stops.map((s) => ({
				id: s.route_station_id,
				routeId: s.route_id,
				stationId: s.station_id,
				stationName: s.station_name,
				address: s.address,
				provinceName: s.province_name,
				stopOrder: s.stop_order
			}))
		}
	}

	async createRoute(input: CreateRouteInput): Promise<RouteDetailDto> {
		const routeId = input.routeId || `RT-${Date.now().toString().slice(-4)}`
		const intermediateStationsJson = input.intermediateStations
			? JSON.stringify(
					input.intermediateStations.map((s) => ({
						station_id: s.stationId,
						stop_order: s.stopOrder
					}))
			  )
			: null

		await routeRepository.saveRouteWithStops(
			routeId,
			input.departureStationId,
			input.arrivalStationId,
			input.distanceKm,
			input.estimatedDuration,
			intermediateStationsJson
		)

		return this.getRouteById(routeId)
	}

	async updateRoute(routeId: string, input: UpdateRouteInput): Promise<RouteDetailDto> {
		const intermediateStationsJson = input.intermediateStations
			? JSON.stringify(
					input.intermediateStations.map((s) => ({
						station_id: s.stationId,
						stop_order: s.stopOrder
					}))
			  )
			: null

		await routeRepository.saveRouteWithStops(
			routeId,
			input.departureStationId,
			input.arrivalStationId,
			input.distanceKm,
			input.estimatedDuration,
			intermediateStationsJson
		)

		return this.getRouteById(routeId)
	}

	async deleteRoute(routeId: string): Promise<void> {
		await routeRepository.deleteRoute(routeId)
	}
}

export const routeService = new RouteService()
