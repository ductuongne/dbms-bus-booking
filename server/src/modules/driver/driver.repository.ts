import { sql } from '../../config/db.js'
import { executeQuery, executeSP } from '../../database/query.js'
import type { DriverScheduleDto } from '../../types/index.js'
import { AppError } from '../../utils/app-error.js'

export interface DriverPassengerDto {
	ticketId: string
	ticketCode: string
	seatNumber: string
	passengerName: string
	passengerPhone: string
	price: number
	status: string
}

export async function findSchedulesByUserId(
	userId: string
): Promise<DriverScheduleDto[]> {
	return executeQuery<DriverScheduleDto>(
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
		 ORDER BY departure_time ASC`,
		{ userId: { type: sql.VarChar(50), value: userId } }
	)
}

export async function findPassengersByTripId(
	tripId: string,
	userId: string
): Promise<DriverPassengerDto[]> {
	// Kiểm tra tài xế có được phân công lái chuyến này không (chống IDOR)
	const tripCheck = await executeQuery<{ trip_id: string }>(
		`SELECT t.trip_id
		 FROM trips t
		 JOIN drivers d ON d.driver_id = t.driver_id
		 WHERE t.trip_id = @tripId AND d.user_id = @userId`,
		{
			tripId: { type: sql.VarChar(50), value: tripId },
			userId: { type: sql.VarChar(50), value: userId },
		}
	)

	if (tripCheck.length === 0) {
		throw new AppError(403, 'Bạn không được phân công lái chuyến xe này!')
	}

	return executeQuery<DriverPassengerDto>(
		`SELECT tk.ticket_id AS ticketId,
		        tk.ticket_code AS ticketCode,
		        s.seat_number AS seatNumber,
		        tk.passenger_name AS passengerName,
		        tk.passenger_phone AS passengerPhone,
		        tk.price,
		        tk.status
		 FROM tickets tk
		 JOIN seats s ON s.seat_id = tk.seat_id
		 WHERE tk.trip_id = @tripId AND tk.status IN ('CONFIRMED', 'CHECKED_IN')
		 ORDER BY s.seat_number ASC`,
		{ tripId: { type: sql.VarChar(50), value: tripId } }
	)
}

export async function checkInTicket(ticketCode: string): Promise<DriverPassengerDto> {
	const result = await executeSP<DriverPassengerDto>('dbo.sp_CheckIn', {
		ticket_code: { type: sql.VarChar(20), value: ticketCode },
	})

	const record = result.recordset[0]
	if (!record) {
		throw new AppError(404, 'Không tìm thấy thông tin vé sau khi soát!')
	}
	return record
}

export async function updateTripStatus(
	tripId: string,
	status: 'DEPARTED' | 'COMPLETED',
	userId: string
): Promise<void> {
	// Kiểm tra quyền của tài xế đối với chuyến
	const tripCheck = await executeQuery<{ trip_id: string }>(
		`SELECT t.trip_id
		 FROM trips t
		 JOIN drivers d ON d.driver_id = t.driver_id
		 WHERE t.trip_id = @tripId AND d.user_id = @userId`,
		{
			tripId: { type: sql.VarChar(50), value: tripId },
			userId: { type: sql.VarChar(50), value: userId },
		}
	)

	if (tripCheck.length === 0) {
		throw new AppError(403, 'Bạn không được phân công lái chuyến xe này!')
	}

	await executeSP('dbo.sp_DoiTrangThaiChuyen', {
		trip_id: { type: sql.VarChar(50), value: tripId },
		new_status: { type: sql.VarChar(20), value: status },
	})
}

export const driverRepository = {
	findSchedulesByUserId,
	findPassengersByTripId,
	checkInTicket,
	updateTripStatus,
}
