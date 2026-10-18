import { AppError } from '../../middlewares/error-handler'
import {
	type AdminTripListRow,
	type DriverTripRow,
	type SeatStatusRow,
	type TripRow,
	type TripSearchResultRow,
	tripRepository
} from './trip.repository'
import type {
	AdminTripsQuery,
	CreateTripBody,
	SearchTripsQuery,
	UpdateTripBody
} from './trip.schema'

export interface TripSearchResultItem {
	trip_id: string
	departure_time: string
	arrival_time: string
	price: number
	bus_type: string
	availableSeats: number
	route: {
		route_id: string
		departure_station: string
		arrival_station: string
		departure_province: string
		arrival_province: string
	}
}

export interface SearchTripsResponse {
	data: TripSearchResultItem[]
	meta: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface TripSeatsResponse {
	trip: {
		trip_id: string
		route_id: string
		bus_id: string
		departure_time: string
		arrival_time: string
		price: number
		status: string
	}
	seats: Array<{
		seat_id: string
		seat_number: string
		status: SeatStatusRow['status']
		price: number
	}>
}

function formatLocalDateTime(val: Date | string): string {
	if (typeof val === 'string') return val
	const pad = (n: number) => String(n).padStart(2, '0')
	const y = val.getFullYear()
	const m = pad(val.getMonth() + 1)
	const d = pad(val.getDate())
	const h = pad(val.getHours())
	const min = pad(val.getMinutes())
	const s = pad(val.getSeconds())
	return `${y}-${m}-${d}T${h}:${min}:${s}`
}

export class TripService {
	async searchTrips(filters: SearchTripsQuery): Promise<SearchTripsResponse> {
		const rows: TripSearchResultRow[] = await tripRepository.searchTrips(filters)
		const total = rows[0]?.totalCount ?? 0
		const totalPages = total > 0 ? Math.ceil(total / filters.limit) : 0

		const data: TripSearchResultItem[] = rows.map((row) => ({
			trip_id: row.trip_id,
			departure_time: formatLocalDateTime(row.departure_time),
			arrival_time: formatLocalDateTime(row.arrival_time),
			price: Number(row.price),
			bus_type: row.bus_type,
			availableSeats: Number(row.availableSeats),
			route: {
				route_id: row.route_id,
				departure_station: row.departure_station,
				arrival_station: row.arrival_station,
				departure_province: row.departure_province,
				arrival_province: row.arrival_province
			}
		}))

		return {
			data,
			meta: {
				page: filters.page,
				limit: filters.limit,
				total,
				totalPages
			}
		}
	}

	async getTripSeats(tripId: string): Promise<TripSeatsResponse> {
		const trip = await tripRepository.findTripById(tripId)
		if (!trip) {
			throw new AppError(404, 'Chuyến đi không tồn tại')
		}

		if (trip.status === 'CANCELLED') {
			throw new AppError(422, 'Chuyến đi đã bị hủy')
		}

		const seats = await tripRepository.getTripSeats(tripId)

		return {
			trip: {
				trip_id: trip.trip_id,
				route_id: trip.route_id,
				bus_id: trip.bus_id,
				departure_time: formatLocalDateTime(trip.departure_time),
				arrival_time: formatLocalDateTime(trip.arrival_time),
				price: Number(trip.price),
				status: trip.status
			},
			seats: seats.map((s: SeatStatusRow) => ({
				seat_id: s.seat_id,
				seat_number: s.seat_number,
				status: s.status,
				price: Number(s.price)
			}))

		}
	}

	async createTrip(body: CreateTripBody): Promise<Record<string, unknown>> {
		const row = await tripRepository.createTrip({
			route_id: body.route_id,
			bus_id: body.bus_id,
			driver_id: body.driver_id,
			departure_time: new Date(body.departure_time),
			arrival_time: new Date(body.arrival_time),
			price: body.price
		})
		return {
			trip_id: row.trip_id,
			route_id: row.route_id,
			bus_id: row.bus_id,
			driver_id: row.driver_id,
			departure_time: formatLocalDateTime(row.departure_time),
			arrival_time: formatLocalDateTime(row.arrival_time),
			price: Number(row.price),
			status: row.status
		}
	}

	async getAdminTrips(filters: AdminTripsQuery): Promise<Record<string, unknown>> {
		const rows = await tripRepository.getAdminTrips(filters)
		const total = rows[0]?.totalCount ?? 0
		const totalPages = total > 0 ? Math.ceil(total / filters.limit) : 0
		return {
			data: rows.map((r: AdminTripListRow) => ({
				trip_id: r.trip_id,
				route_id: r.route_id,
				bus_id: r.bus_id,
				driver_id: r.driver_id,
				departure_time: formatLocalDateTime(r.departure_time),
				arrival_time: formatLocalDateTime(r.arrival_time),
				price: Number(r.price),
				status: r.status,
				total_seats: Number(r.total_seats),
				booked_seats: Number(r.booked_seats),
				pending_seats: Number(r.pending_seats)
			})),
			meta: {
				page: filters.page,
				limit: filters.limit,
				total,
				totalPages
			}
		}
	}

	async getTripDetail(tripId: string): Promise<Record<string, unknown>> {
		const trip = await tripRepository.findTripById(tripId)
		if (!trip) {
			throw new AppError(404, 'Chuyến không tồn tại')
		}
		return {
			trip_id: trip.trip_id,
			route_id: trip.route_id,
			bus_id: trip.bus_id,
			driver_id: trip.driver_id,
			departure_time: formatLocalDateTime(trip.departure_time),
			arrival_time: formatLocalDateTime(trip.arrival_time),
			price: Number(trip.price),
			status: trip.status
		}
	}

	async updateTrip(tripId: string, body: UpdateTripBody): Promise<Record<string, unknown>> {
		const row = await tripRepository.updateTrip(tripId, {
			bus_id: body.bus_id,
			driver_id: body.driver_id,
			departure_time: body.departure_time ? new Date(body.departure_time) : undefined,
			arrival_time: body.arrival_time ? new Date(body.arrival_time) : undefined,
			price: body.price
		})
		return {
			trip_id: row.trip_id,
			route_id: row.route_id,
			bus_id: row.bus_id,
			driver_id: row.driver_id,
			departure_time: formatLocalDateTime(row.departure_time),
			arrival_time: formatLocalDateTime(row.arrival_time),
			price: Number(row.price),
			status: row.status
		}
	}

	async cancelTrip(tripId: string): Promise<Record<string, unknown>> {
		const result = await tripRepository.cancelTrip(tripId)
		return {
			message: 'Hủy chuyến thành công',
			trip_id: tripId,
			cancelled_bookings: result.cancelled_bookings,
			cancelled_tickets: result.cancelled_tickets
		}
	}

	async changeTripStatus(tripId: string, status: string): Promise<Record<string, unknown>> {
		const row = await tripRepository.changeTripStatus(tripId, status)
		return {
			trip_id: row.trip_id,
			route_id: row.route_id,
			bus_id: row.bus_id,
			driver_id: row.driver_id,
			departure_time: formatLocalDateTime(row.departure_time),
			arrival_time: formatLocalDateTime(row.arrival_time),
			price: Number(row.price),
			status: row.status
		}
	}

	async getDriverTrips(userId: string, date?: string): Promise<Record<string, unknown>[]> {
		const rows = await tripRepository.getDriverTrips(userId, date)
		return rows.map((r: DriverTripRow) => ({
			trip_id: r.trip_id,
			route_id: r.route_id,
			bus_id: r.bus_id,
			driver_id: r.driver_id,
			departure_time: formatLocalDateTime(r.departure_time),
			arrival_time: formatLocalDateTime(r.arrival_time),
			price: Number(r.price),
			status: r.status,
			departure_station: r.departure_station,
			arrival_station: r.arrival_station,
			departure_province: r.departure_province,
			arrival_province: r.arrival_province,
			bus_type: r.bus_type
		}))
	}
}

export const tripService = new TripService()


