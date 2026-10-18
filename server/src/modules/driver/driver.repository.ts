import { getPool, sql } from '../../config/db.js'
import type { DriverScheduleDto } from '../../types/index.js'

export async function findSchedulesByUserId(
	userId: string
): Promise<DriverScheduleDto[]> {
	const pool = await getPool()
	const request = pool.request()

	request.input('userId', sql.VarChar(50), userId)

	const result = await request.query<DriverScheduleDto>(
		`SELECT trip_id AS tripId,
		        driver_id AS driverId,
		        user_id AS userId,
		        driver_name AS driverName,
		        driver_phone AS driverPhone,
		        license_number AS licenseNumber,
		        departure_time AS departureTime,
		        arrival_time AS arrivalTime,
		        trip_status AS tripStatus,
		        route_id AS routeId,
		        departure_station AS departureStation,
		        arrival_station AS arrivalStation,
		        distance_km AS distanceKm,
		        license_plate AS licensePlate,
		        bus_type AS busType,
		        total_seats AS totalSeats
		 FROM vw_LichPhanCongTaiXe
		 WHERE user_id = @userId
		 ORDER BY departure_time ASC`
	)

	return result.recordset
}

export const driverRepository = {
	findSchedulesByUserId,
}
