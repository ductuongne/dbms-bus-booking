import { sql } from '../../config/db'
import { executeSP } from '../../database/query'
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

export interface BookingWithTickets {
	booking: BookingRow | undefined
	tickets: TicketRow[]
}

export interface HoldBookingInput {
	customerId: string | null
	tripId: string
	passengers: PassengerInput[]
	channel: string
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
			channel: { type: sql.VarChar(20), value: input.channel }
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
}

export const bookingRepository = new BookingRepository()

