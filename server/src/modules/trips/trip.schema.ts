import { z } from 'zod'

export const searchTripsQuerySchema = z.object({
	fromProvinceId: z.string().min(1, 'fromProvinceId là bắt buộc'),
	toProvinceId: z.string().min(1, 'toProvinceId là bắt buộc'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date phải có định dạng YYYY-MM-DD'),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10)
})

export const tripSeatsParamsSchema = z.object({
	tripId: z.string().min(1, 'tripId là bắt buộc')
})

export type SearchTripsQuery = z.infer<typeof searchTripsQuerySchema>
export type TripSeatsParams = z.infer<typeof tripSeatsParamsSchema>


