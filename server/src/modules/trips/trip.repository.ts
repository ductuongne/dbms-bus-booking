import { sql } from '../../config/db'
import { executeQuery, executeSP } from '../../database/query'
import type { AdminTripsQuery, SearchTripsQuery } from './trip.schema'
export interface AdminTripListRow {
	trip_id: string
	route_id: string
	bus_id: string
	driver_id: string
	departure_time: Date
	arrival_time: Date
	price: number
	status: string
	total_seats: number
	booked_seats: number
	pending_seats: number
	totalCount: number
}
export interface DriverTripRow {
	trip_id: string
	route_id: string
	bus_id: string
	driver_id: string
	departure_time: Date
	arrival_time: Date
	price: number
	status: string
	departure_station: string
	arrival_station: string
	departure_province: string
	arrival_province: string
	bus_type: string
}
export interface CreateTripInput {
	route_id: string
	bus_id: string
	driver_id: string
	departure_time: Date
	arrival_time: Date
	price: number
}
export interface UpdateTripInput {
	bus_id?: string | undefined
	driver_id?: string | undefined
	departure_time?: Date | undefined
	arrival_time?: Date | undefined
	price?: number | undefined
}

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
	async createTrip(input: CreateTripInput): Promise<TripRow> {
		const result = await executeSP<TripRow>('sp_TaoChuyen', {
			route_id: { type: sql.VarChar(50), value: input.route_id },
			bus_id: { type: sql.VarChar(50), value: input.bus_id },
			driver_id: { type: sql.VarChar(50), value: input.driver_id },
			departure_time: { type: sql.DateTime2, value: input.departure_time },
			arrival_time: { type: sql.DateTime2, value: input.arrival_time },
			price: { type: sql.Decimal(12, 2), value: input.price },
			trip_id: { type: sql.VarChar(50), value: null, output: true }
		})
		return result.recordset[0]!
	}
	async getAdminTrips(filters: AdminTripsQuery): Promise<AdminTripListRow[]> {
		const result = await executeSP<AdminTripListRow>('dbo.sp_LayDanhSachChuyenAdmin', {
			date: { type: sql.VarChar(10), value: filters.date ?? null },
			status: { type: sql.VarChar(20), value: filters.status ?? null },
			routeId: { type: sql.VarChar(50), value: filters.routeId ?? null },
			offset: { type: sql.Int, value: (filters.page - 1) * filters.limit },
			limit: { type: sql.Int, value: filters.limit }
		})
		return result.recordset
	}
	async updateTrip(tripId: string, input: UpdateTripInput): Promise<TripRow> {
		const result = await executeSP<TripRow>('sp_SuaChuyen', {
			trip_id: { type: sql.VarChar(50), value: tripId },
			bus_id: { type: sql.VarChar(50), value: input.bus_id ?? null },
			driver_id: { type: sql.VarChar(50), value: input.driver_id ?? null },
			departure_time: { type: sql.DateTime2, value: input.departure_time ?? null },
			arrival_time: { type: sql.DateTime2, value: input.arrival_time ?? null },
			price: { type: sql.Decimal(12, 2), value: input.price ?? null }
		})
		return result.recordset[0]!
	}
	async cancelTrip(tripId: string): Promise<{ cancelled_bookings: number; cancelled_tickets: number }> {
		const result = await executeSP<{ cancelled_bookings: number; cancelled_tickets: number }>('sp_HuyChuyen', {
			trip_id: { type: sql.VarChar(50), value: tripId }
		})
		return result.recordset[0] ?? { cancelled_bookings: 0, cancelled_tickets: 0 }
	}
	async changeTripStatus(tripId: string, newStatus: string): Promise<TripRow> {
		const result = await executeSP<TripRow>('sp_DoiTrangThaiChuyen', {
			trip_id: { type: sql.VarChar(50), value: tripId },
			new_status: { type: sql.VarChar(20), value: newStatus }
		})
		return result.recordset[0]!
	}
	async getDriverTrips(userId: string, date?: string): Promise<DriverTripRow[]> {
		const query = `
			SELECT
				trip_id,
				route_id,
				bus_id,
				driver_id,
				departure_time,
				arrival_time,
				price,
				status,
				departure_station,
				arrival_station,
				departure_province,
				arrival_province,
				bus_type
			FROM dbo.vw_DriverTrips
			WHERE user_id = @userId
			  AND (@date IS NULL OR CAST(departure_time AS DATE) = @date)
			ORDER BY departure_time ASC;
		`
		return executeQuery<DriverTripRow>(query, {
			userId: { type: sql.VarChar(50), value: userId },
			date: { type: sql.VarChar(10), value: date ?? null }
		})
	}
}

export const tripRepository = new TripRepository()
