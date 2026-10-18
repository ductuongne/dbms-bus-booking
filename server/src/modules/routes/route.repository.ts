import { sql } from '../../config/db'
import { executeQuery, executeSP } from '../../database/query'

export interface RouteListRow {
	route_id: string
	departure_station_id: string
	departure_station_name: string
	departure_province_id: string
	departure_province: string
	arrival_station_id: string
	arrival_station_name: string
	arrival_province_id: string
	arrival_province: string
	distance_km: number
	estimated_duration: number
}

export interface RouteDetailRow {
	route_id: string
	departure_station_id: string
	departure_station_name: string
	departure_province_id: string
	departure_province: string
	arrival_station_id: string
	arrival_station_name: string
	arrival_province_id: string
	arrival_province: string
	distance_km: number
	estimated_duration: number
}

export interface RouteStationRow {
	route_station_id: string
	route_id: string
	station_id: string
	station_name: string
	address: string
	province_name: string
	stop_order: number
}

export class RouteRepository {
	async getAllRoutes(): Promise<RouteListRow[]> {
		return executeQuery<RouteListRow>(
			'SELECT route_id, departure_station_id, departure_station_name, departure_province_id, departure_province, arrival_station_id, arrival_station_name, arrival_province_id, arrival_province, distance_km, estimated_duration FROM dbo.vw_RouteList ORDER BY departure_province ASC, arrival_province ASC'
		)
	}

	async getRouteById(routeId: string): Promise<{
		route: RouteDetailRow | null
		stops: RouteStationRow[]
	}> {
		const result = await executeSP<RouteDetailRow>('dbo.sp_LayChiTietTuyen', {
			route_id: { type: sql.VarChar(50), value: routeId }
		})

		const route = result.recordsets[0]?.[0] ?? null
		const stops = (result.recordsets[1] as unknown as RouteStationRow[]) ?? []
		return { route, stops }
	}

	async saveRouteWithStops(
		routeId: string,
		departureStationId: string,
		arrivalStationId: string,
		distanceKm: number,
		estimatedDuration: number,
		intermediateStationsJson: string | null
	): Promise<void> {
		await executeSP('dbo.sp_LuuTuyenVaTramDung', {
			route_id: { type: sql.VarChar(50), value: routeId },
			departure_station_id: { type: sql.VarChar(50), value: departureStationId },
			arrival_station_id: { type: sql.VarChar(50), value: arrivalStationId },
			distance_km: { type: sql.Decimal(10, 2), value: distanceKm },
			estimated_duration: { type: sql.Int, value: estimatedDuration },
			intermediate_stations: {
				type: sql.NVarChar(sql.MAX),
				value: intermediateStationsJson
			}
		})
	}

	async deleteRoute(routeId: string): Promise<void> {
		await executeSP('dbo.sp_XoaTuyen', {
			route_id: { type: sql.VarChar(50), value: routeId }
		})
	}
}

export const routeRepository = new RouteRepository()
