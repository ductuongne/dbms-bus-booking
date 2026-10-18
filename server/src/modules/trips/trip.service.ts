import { AppError } from '../../middlewares/error-handler'
import {
	type SeatStatusRow,
	type TripSearchResultRow,
	tripRepository
} from './trip.repository'
import type { SearchTripsQuery } from './trip.schema'

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
}

export const tripService = new TripService()


