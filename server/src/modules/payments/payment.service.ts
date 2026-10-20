import { AppError } from '../../middlewares/error-handler'
import { type PaymentLookupRow, type PaymentRow, paymentRepository } from './payment.repository'
import type { PayBookingBody } from './payment.schema'

export interface PaymentResponse {
	payment_id: string
	booking_id: string
	method: string
	amount: number
	paid_at: string | null
	transaction_code: string | null
	status: string
}

export interface PaymentLookupResponse {
	booking_code: string
	payment_status: string
	total_paid: number
	payments: PaymentResponse[]
}

function formatLocalDateTime(value: Date | null): string | null {
	if (value === null) return null
	const pad = (n: number): string => String(n).padStart(2, '0')
	const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
	const time = `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
	return `${date}T${time}`
}

function mapPayment(row: PaymentRow): PaymentResponse {
	return {
		payment_id: row.payment_id,
		booking_id: row.booking_id,
		method: row.method,
		amount: Number(row.amount),
		paid_at: formatLocalDateTime(row.paid_at),
		transaction_code: row.transaction_code,
		status: row.status
	}
}

function mapLookup(rows: PaymentLookupRow[]): PaymentLookupResponse {
	const first = rows[0]
	if (!first) {
		throw new AppError(404, 'Booking chưa có giao dịch thanh toán')
	}

	return {
		booking_code: first.booking_code,
		payment_status: first.booking_payment_status,
		total_paid: Number(first.total_paid),
		payments: rows.map(mapPayment)
	}
}

export class PaymentService {
	async payBooking(bookingId: string, body: PayBookingBody): Promise<PaymentResponse> {
		const payment = await paymentRepository.payBooking({
			bookingId,
			bookingCode: body.booking_code,
			phone: body.phone,
			method: body.method,
			transactionCode: body.transaction_code ?? null
		})

		if (!payment) {
			throw new AppError(404, 'Booking không tồn tại hoặc thông tin xác thực không đúng')
		}

		return mapPayment(payment)
	}

	async lookupPayments(bookingCode: string, phone: string): Promise<PaymentLookupResponse> {
		return mapLookup(await paymentRepository.lookupPayments(bookingCode, phone))
	}
}

export const paymentService = new PaymentService()
