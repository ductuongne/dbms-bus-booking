import { sql } from '../../config/db'
import { executeQuery } from '../../database/query'
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
		const offset = (filters.page - 1) * filters.limit

		const query = `
			WITH TripSeats AS (
				SELECT 
					t.trip_id,
					t.departure_time,
					t.arrival_time,
					t.price,
					bt.name AS bus_type,
					r.route_id,
					ds.name AS departure_station,
					ast.name AS arrival_station,
					dp.name AS departure_province,
					ap.name AS arrival_province,
					(
						(SELECT COUNT(*) FROM seats s WHERE s.bus_id = t.bus_id)
						- (SELECT COUNT(DISTINCT tk.seat_id)
						   FROM tickets tk JOIN bookings b ON b.booking_id = tk.booking_id
						   WHERE tk.trip_id = t.trip_id
						     AND (tk.status = 'CONFIRMED'
						          OR (tk.status = 'PENDING' AND b.expired_at > SYSDATETIME())))
					) AS availableSeats
				FROM trips t
				JOIN routes r ON r.route_id = t.route_id
				JOIN stations ds ON ds.station_id = r.departure_station_id
				JOIN stations ast ON ast.station_id = r.arrival_station_id
				JOIN provinces dp ON dp.province_id = ds.province_id
				JOIN provinces ap ON ap.province_id = ast.province_id
				JOIN buses b ON b.bus_id = t.bus_id
				JOIN bus_types bt ON bt.type_id = b.type_id
				WHERE ds.province_id = @fromProvinceId
				  AND ast.province_id = @toProvinceId
				  AND CAST(t.departure_time AS DATE) = @date
				  AND t.status = 'SCHEDULED'
				  AND t.departure_time > SYSDATETIME()
			)
			SELECT 
				trip_id, departure_time, arrival_time, price, bus_type,
				route_id, departure_station, arrival_station, departure_province, arrival_province,
				availableSeats,
				COUNT(*) OVER() AS totalCount
			FROM TripSeats
			WHERE availableSeats > 0
			ORDER BY departure_time ASC
			OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
		`

		return executeQuery<TripSearchResultRow>(query, {
			fromProvinceId: { type: sql.VarChar(50), value: filters.fromProvinceId },
			toProvinceId: { type: sql.VarChar(50), value: filters.toProvinceId },
			date: { type: sql.VarChar(10), value: filters.date },
			offset: { type: sql.Int, value: offset },
			limit: { type: sql.Int, value: filters.limit }
		})
	}

	async findTripById(tripId: string): Promise<TripRow | null> {
		const query = `
			SELECT trip_id, route_id, bus_id, driver_id, departure_time, arrival_time, price, status
			FROM trips
			WHERE trip_id = @tripId
		`

		const rows = await executeQuery<TripRow>(query, {
			tripId: { type: sql.VarChar(50), value: tripId }
		})

		return rows[0] ?? null
	}

	async getTripSeats(tripId: string): Promise<SeatStatusRow[]> {
		const query = `
			SELECT s.seat_id, s.seat_number,
			       COALESCE(a.status, 'AVAILABLE') AS status,
			       dbo.fn_TinhGiaVe(@tripId, s.seat_id) AS price
			FROM seats s
			JOIN trips t ON t.bus_id = s.bus_id AND t.trip_id = @tripId
			OUTER APPLY (
				SELECT TOP 1 tk.status
				FROM tickets tk JOIN bookings b ON b.booking_id = tk.booking_id
				WHERE tk.trip_id = @tripId AND tk.seat_id = s.seat_id
				  AND (tk.status = 'CONFIRMED'
				       OR (tk.status = 'PENDING' AND b.expired_at > SYSDATETIME()))
				ORDER BY CASE WHEN tk.status = 'CONFIRMED' THEN 0 ELSE 1 END
			) a
			ORDER BY s.seat_number;
		`

		return executeQuery<SeatStatusRow>(query, {
			tripId: { type: sql.VarChar(50), value: tripId }
		})
	}
}

export const tripRepository = new TripRepository()


