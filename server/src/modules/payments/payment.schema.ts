import { z } from 'zod'

export const payBookingParamsSchema = z.object({
	bookingId: z.string().trim().min(1, 'bookingId là bắt buộc')
})

export const payBookingBodySchema = z
	.object({
		booking_code: z.string().trim().min(1, 'booking_code là bắt buộc'),
		phone: z.string().trim().min(1, 'phone là bắt buộc'),
		method: z.enum(['CASH', 'BANK_TRANSFER']),
		transaction_code: z.string().trim().min(1, 'transaction_code không hợp lệ').max(100).optional()
	})
	.refine((body) => body.method !== 'BANK_TRANSFER' || body.transaction_code !== undefined, {
		message: 'transaction_code là bắt buộc khi chuyển khoản',
		path: ['transaction_code']
	})

export const lookupPaymentParamsSchema = z.object({
	bookingCode: z.string().trim().min(1, 'bookingCode là bắt buộc')
})

export const lookupPaymentQuerySchema = z.object({
	phone: z.string().trim().min(1, 'phone là bắt buộc')
})

export type PayBookingParams = z.infer<typeof payBookingParamsSchema>
export type PayBookingBody = z.infer<typeof payBookingBodySchema>
export type LookupPaymentParams = z.infer<typeof lookupPaymentParamsSchema>
export type LookupPaymentQuery = z.infer<typeof lookupPaymentQuerySchema>
