import { z } from 'zod'

export const passengerSchema = z.object({
	seat_id: z.string().trim().min(1, 'seat_id là bắt buộc'),
	name: z.string().trim().min(1, 'name là bắt buộc'),
	phone: z.string().trim().min(1, 'phone là bắt buộc')
})

export const holdBookingBodySchema = z.object({
	customer_id: z.string().trim().min(1, 'customer_id không hợp lệ').optional(),
	trip_id: z.string().trim().min(1, 'trip_id là bắt buộc'),
	passengers: z
		.array(passengerSchema)
		.min(1, 'passengers phải có ít nhất 1 phần tử')
		.max(5, 'passengers tối đa 5 phần tử'),
	channel: z.enum(['ONLINE', 'COUNTER']).default('ONLINE')
})

export const confirmBookingBodySchema = z.object({
	booking_code: z.string().trim().min(1, 'booking_code là bắt buộc'),
	phone: z.string().trim().min(1, 'phone là bắt buộc'),
	payment_method: z.enum(['CASH', 'BANK_TRANSFER']).optional()
})

export const cancelBookingBodySchema = z.object({
	booking_code: z.string().trim().min(1, 'booking_code là bắt buộc'),
	phone: z.string().trim().min(1, 'phone là bắt buộc'),
	ticket_id: z.string().trim().min(1, 'ticket_id không hợp lệ').optional()
})

export const bookingIdParamsSchema = z.object({
	bookingId: z.string().min(1, 'bookingId là bắt buộc')
})

export type PassengerInput = z.infer<typeof passengerSchema>
export type HoldBookingBody = z.infer<typeof holdBookingBodySchema>
export type ConfirmBookingBody = z.infer<typeof confirmBookingBodySchema>
export type CancelBookingBody = z.infer<typeof cancelBookingBodySchema>
export type BookingIdParams = z.infer<typeof bookingIdParamsSchema>

