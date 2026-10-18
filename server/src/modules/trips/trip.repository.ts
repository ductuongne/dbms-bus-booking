import { sql } from '../../config/db'
import { executeQuery, executeSP } from '../../database/query'
import type { SearchTripsQuery } from './trip.schema'

export interface TripSearchResultRow {
	trip_id: string
	departure_time: Date
	arrival_time: Date
	price: number
	bus_type: string
	route_id: string
	departure_station: string
	arrival_station: string
	departure_province: string
	arrival_province: string
	availableSeats: number
	totalCount: number
}

export interface TripRow {
	trip_id: string
	route_id: string
	bus_id: string
	driver_id: string
	departure_time: Date
	arrival_time: Date
	price: number
	status: string
}

export interface SeatStatusRow {
	seat_id: string
	seat_number: string
	status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED'
	price: number
}

export class TripRepository {
	async searchTrips(filters: SearchTripsQuery): Promise<TripSearchResultRow[]> {
		const result = await executeSP<TripSearchResultRow>('sp_TraCuuChuyenDi', {
			fromProvinceId: { type: sql.VarChar(50), value: filters.fromProvinceId },
			toProvinceId: { type: sql.VarChar(50), value: filters.toProvinceId },
			date: { type: sql.VarChar(10), value: filters.date },
			offset: { type: sql.Int, value: (filters.page - 1) * filters.limit },
			limit: { type: sql.Int, value: filters.limit }
		})

		return result.recordset
	}

	async findTripById(tripId: string): Promise<TripRow | null> {
		const query = `
			SELECT trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status
			FROM dbo.vw_ChiTietChuyenDi
			WHERE trip_id = @tripId
		`

		const rows = await executeQuery<TripRow>(query, {
			tripId: { type: sql.VarChar(50), value: tripId }
		})

		return rows[0] ?? null
	}

	async getTripSeats(tripId: string): Promise<SeatStatusRow[]> {
		return executeQuery<SeatStatusRow>(
			'SELECT * FROM dbo.fn_LaySoDoGhe(@tripId) ORDER BY seat_number',
			{ tripId: { type: sql.VarChar(50), value: tripId } }
		)
	}
}

export const tripRepository = new TripRepository()


