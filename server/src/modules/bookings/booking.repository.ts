import { sql } from '../../config/db'
import { executeQuery, executeSP } from '../../database/query'
import type { PassengerInput } from './booking.schema'

export interface BookingRow {
	booking_id: string
	booking_code: string
	customer_id: string
	channel: string
	created_at: Date
	expired_at: Date
	total_amount: number
	status: string
}

export interface TicketRow {
	ticket_id: string
	ticket_code: string
	booking_id: string
	trip_id: string
	seat_id: string
	passenger_name: string
	passenger_phone: string
	price: number
	status: string
}

export interface StaffBookingTicketRow {
	ticket_id: string
	ticket_code: string
	booking_id: string
	trip_id: string
	seat_id: string
	seat_number: string
	passenger_name: string
	passenger_phone: string
	price: number
	status: string
}

export interface CheckedInTicketRow {
	ticket_id: string
	ticket_code: string
	seat_id: string
	passenger_name: string
	passenger_phone: string
	status: string
}

export interface BookingWithTickets {
	booking: BookingRow | undefined
	tickets: TicketRow[]
}

export interface HoldBookingInput {
	customerId: string | null
	tripId: string
	passengers: PassengerInput[]
	channel: string
	email?: string | null
}

function splitResult(recordsets: BookingRow[][]): BookingWithTickets {
	const booking = recordsets[0]?.[0]
	const tickets = (recordsets[1] ?? []) as unknown as TicketRow[]

	return { booking, tickets }
}

export class BookingRepository {
	async holdBooking(input: HoldBookingInput): Promise<BookingWithTickets> {
		const result = await executeSP<BookingRow>('sp_GiuCho', {
			booking_id: { type: sql.VarChar(50), value: null, output: true },
			customer_id: { type: sql.VarChar(50), value: input.customerId ?? null },
			trip_id: { type: sql.VarChar(50), value: input.tripId },
			passengers: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(input.passengers) },
			channel: { type: sql.VarChar(20), value: input.channel },
			email: { type: sql.VarChar(100), value: input.email ?? null }
		})

		return splitResult(result.recordsets)
	}

	async confirmBooking(input: {
		bookingId: string
		bookingCode: string
		phone: string
		paymentMethod: string | null
	}): Promise<BookingWithTickets> {
		const result = await executeSP<BookingRow>('sp_DatVe', {
			booking_id: { type: sql.VarChar(50), value: input.bookingId },
			booking_code: { type: sql.VarChar(20), value: input.bookingCode },
			phone: { type: sql.VarChar(20), value: input.phone },
			payment_method: { type: sql.VarChar(20), value: input.paymentMethod }
		})

		return splitResult(result.recordsets)
	}

	async cancelBooking(input: {
		bookingId: string
		bookingCode: string
		phone: string
		ticketId: string | null
	}): Promise<BookingWithTickets> {
		const result = await executeSP<BookingRow>('sp_HuyGiuCho', {
			booking_id: { type: sql.VarChar(50), value: input.bookingId },
			booking_code: { type: sql.VarChar(20), value: input.bookingCode },
			phone: { type: sql.VarChar(20), value: input.phone },
			ticket_id: { type: sql.VarChar(50), value: input.ticketId }
		})

		return splitResult(result.recordsets)
	}

	async findBookingByCode(bookingCode: string): Promise<{ booking: BookingRow | null; tickets: StaffBookingTicketRow[] }> {
		const result = await executeSP<BookingRow>('dbo.sp_LayVeTheoMaBooking', {
			booking_code: { type: sql.VarChar(20), value: bookingCode }
		})

		const booking = result.recordsets[0]?.[0] ?? null
		const tickets = (result.recordsets[1] ?? []) as unknown as StaffBookingTicketRow[]

		return { booking, tickets }
	}
	async getTripTickets(tripId: string, status?: string): Promise<StaffBookingTicketRow[] | null> {
		const tripRows = await executeQuery<{ trip_id: string }>(
			'SELECT trip_id FROM trips WHERE trip_id = @tripId',
			{ tripId: { type: sql.VarChar(50), value: tripId } }
		)
		if (tripRows.length === 0) {
			return null
		}

		return executeQuery<StaffBookingTicketRow>(
			'SELECT * FROM dbo.fn_LayVeTheoChuyen(@tripId, @status) ORDER BY seat_number ASC',
			{
				tripId: { type: sql.VarChar(50), value: tripId },
				status: { type: sql.VarChar(20), value: status ?? null }
			}
		)
	}
	async checkInTicket(ticketCode: string): Promise<CheckedInTicketRow> {
		const result = await executeSP<CheckedInTicketRow>('sp_CheckIn', {
			ticket_code: { type: sql.VarChar(20), value: ticketCode }
		})
		return result.recordset[0]!
	}
}

export const bookingRepository = new BookingRepository()

