import { AppError } from '../../middlewares/error-handler'
import {
	type BookingRow,
	type BookingWithTickets,
	type CheckedInTicketRow,
	type StaffBookingTicketRow,
	type TicketRow,
	bookingRepository
} from './booking.repository'
import type { CancelBookingBody, ConfirmBookingBody, HoldBookingBody } from './booking.schema'

export interface HoldBookingResponse {
	booking_id: string
	booking_code: string
	expired_at: string
	total_amount: number
	tickets: TicketResponse[]
}

export interface TicketResponse {
	ticket_id: string
	ticket_code: string
	seat_id: string
	passenger_name: string
	price: number
	status: string
}

export interface BookingResponse {
	booking_id: string
	booking_code: string
	channel: string
	created_at: string
	expired_at: string
	total_amount: number
	status: string
}

export interface ConfirmBookingResponse {
	booking: BookingResponse
	tickets: TicketResponse[]
}

export interface CancelBookingResponse {
	message: string
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

function mapTicket(row: TicketRow): TicketResponse {
	return {
		ticket_id: row.ticket_id,
		ticket_code: row.ticket_code,
		seat_id: row.seat_id,
		passenger_name: row.passenger_name,
		price: Number(row.price),
		status: row.status
	}
}

function mapBooking(row: BookingRow): BookingResponse {
	return {
		booking_id: row.booking_id,
		booking_code: row.booking_code,
		channel: row.channel,
		created_at: formatLocalDateTime(row.created_at),
		expired_at: formatLocalDateTime(row.expired_at),
		total_amount: Number(row.total_amount),
		status: row.status
	}
}

function requireBooking(result: BookingWithTickets): { booking: BookingRow; tickets: TicketRow[] } {
	if (!result.booking) {
		throw new AppError(404, 'Booking không tồn tại hoặc thông tin xác thực không đúng')
	}
	return { booking: result.booking, tickets: result.tickets }
}

export class BookingService {
	async holdBooking(body: HoldBookingBody): Promise<HoldBookingResponse> {
		const { booking, tickets } = requireBooking(
			await bookingRepository.holdBooking({
				customerId: body.customer_id ?? null,
				tripId: body.trip_id,
				passengers: body.passengers,
				channel: body.channel,
				email: body.email ?? null
			})
		)

		return {
			booking_id: booking.booking_id,
			booking_code: booking.booking_code,
			expired_at: formatLocalDateTime(booking.expired_at),
			total_amount: Number(booking.total_amount),
			tickets: tickets.map(mapTicket)
		}
	}

	async confirmBooking(bookingId: string, body: ConfirmBookingBody): Promise<ConfirmBookingResponse> {
		const { booking, tickets } = requireBooking(
			await bookingRepository.confirmBooking({
				bookingId,
				bookingCode: body.booking_code,
				phone: body.phone,
				paymentMethod: body.payment_method ?? null
			})
		)

		return {
			booking: mapBooking(booking),
			tickets: tickets.map(mapTicket)
		}
	}

	async cancelBooking(bookingId: string, body: CancelBookingBody): Promise<CancelBookingResponse> {
		await requireBooking(
			await bookingRepository.cancelBooking({
				bookingId,
				bookingCode: body.booking_code,
				phone: body.phone,
				ticketId: body.ticket_id ?? null
			})
		)

		return { message: 'Hủy giữ chỗ thành công' }
	}

	async getBookingByCode(bookingCode: string): Promise<Record<string, unknown>> {
		const item = await bookingRepository.findBookingByCode(bookingCode)
		if (!item) {
			throw new AppError(404, 'Booking không tồn tại')
		}

		return {
			booking: {
				booking_id: item.booking.booking_id,
				booking_code: item.booking.booking_code,
				customer_id: item.booking.customer_id,
				customer_name: item.booking.customer_name,
				customer_phone: item.booking.customer_phone,
				channel: item.booking.channel,
				created_at: formatLocalDateTime(item.booking.created_at),
				expired_at: formatLocalDateTime(item.booking.expired_at),
				total_amount: Number(item.booking.total_amount),
				status: item.booking.status,
				trip_summary: item.booking.trip_summary
					? {
							departure_time: item.booking.trip_summary.departure_time
								? formatLocalDateTime(item.booking.trip_summary.departure_time)
								: undefined,
							route_name: item.booking.trip_summary.route_name
					  }
					: undefined
			},
			tickets: item.tickets.map((t: StaffBookingTicketRow) => ({
				ticket_id: t.ticket_id,
				ticket_code: t.ticket_code,
				seat_id: t.seat_id,
				seat_number: t.seat_number,
				passenger_name: t.passenger_name,
				passenger_phone: t.passenger_phone,
				price: Number(t.price),
				status: t.status
			}))
		}
	}

	async getBookingsByPhone(phone: string): Promise<Record<string, unknown>[]> {
		const cleanPhone = phone.trim()
		if (!cleanPhone) {
			throw new AppError(400, 'Số điện thoại không hợp lệ')
		}

		const results = await bookingRepository.findBookingsByPhone(cleanPhone)
		return results.map((item) => ({
			booking: {
				booking_id: item.booking.booking_id,
				booking_code: item.booking.booking_code,
				customer_id: item.booking.customer_id,
				customer_name: item.booking.customer_name,
				customer_phone: item.booking.customer_phone,
				channel: item.booking.channel,
				created_at: formatLocalDateTime(item.booking.created_at),
				expired_at: formatLocalDateTime(item.booking.expired_at),
				total_amount: Number(item.booking.total_amount),
				status: item.booking.status,
				trip_summary: item.booking.trip_summary
					? {
							departure_time: item.booking.trip_summary.departure_time
								? formatLocalDateTime(item.booking.trip_summary.departure_time)
								: undefined,
							route_name: item.booking.trip_summary.route_name
					  }
					: undefined
			},
			tickets: item.tickets.map((t) => ({
				ticket_id: t.ticket_id,
				ticket_code: t.ticket_code,
				seat_id: t.seat_id,
				seat_number: t.seat_number,
				passenger_name: t.passenger_name,
				passenger_phone: t.passenger_phone,
				price: Number(t.price),
				status: t.status
			}))
		}))
	}

	async getTripTickets(tripId: string, status?: string): Promise<Record<string, unknown>[]> {
		const tickets = await bookingRepository.getTripTickets(tripId, status)
		if (tickets === null) {
			throw new AppError(404, 'Chuyến không tồn tại')
		}

		return tickets.map((t: StaffBookingTicketRow) => ({
			ticket_id: t.ticket_id,
			ticket_code: t.ticket_code,
			seat_id: t.seat_id,
			seat_number: t.seat_number,
			passenger_name: t.passenger_name,
			passenger_phone: t.passenger_phone,
			price: Number(t.price),
			status: t.status
		}))
	}

	async checkInTicket(ticketCode: string): Promise<Record<string, unknown>> {
		const row: CheckedInTicketRow = await bookingRepository.checkInTicket(ticketCode)
		return {
			ticket_id: row.ticket_id,
			ticket_code: row.ticket_code,
			seat_id: row.seat_id,
			passenger_name: row.passenger_name,
			passenger_phone: row.passenger_phone,
			status: row.status
		}
	}
}

export const bookingService = new BookingService()
