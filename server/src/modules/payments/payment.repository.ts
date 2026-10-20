import { sql } from '../../config/db'
import { executeSP } from '../../database/query'

export interface PaymentRow {
	payment_id: string
	booking_id: string
	method: string
	amount: number
	paid_at: Date | null
	transaction_code: string | null
	status: string
}

export interface PaymentLookupRow extends PaymentRow {
	booking_code: string
	booking_payment_status: string
	total_paid: number
}

export interface PayBookingInput {
	bookingId: string
	bookingCode: string
	phone: string
	method: string
	transactionCode: string | null
}

export class PaymentRepository {
	async payBooking(input: PayBookingInput): Promise<PaymentRow | undefined> {
		const result = await executeSP<PaymentRow>('sp_ThanhToan', {
			booking_id: { type: sql.VarChar(50), value: input.bookingId },
			booking_code: { type: sql.VarChar(20), value: input.bookingCode },
			phone: { type: sql.VarChar(20), value: input.phone },
			method: { type: sql.VarChar(20), value: input.method },
			transaction_code: { type: sql.VarChar(100), value: input.transactionCode }
		})

		return result.recordset[0]
	}

	async lookupPayments(bookingCode: string, phone: string): Promise<PaymentLookupRow[]> {
		const result = await executeSP<PaymentLookupRow>('sp_TraCuuThanhToan', {
			booking_code: { type: sql.VarChar(20), value: bookingCode },
			phone: { type: sql.VarChar(20), value: phone }
		})

		return result.recordset
	}
}

export const paymentRepository = new PaymentRepository()
