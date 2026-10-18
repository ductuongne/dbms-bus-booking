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
export const tripIdParamsSchema = tripSeatsParamsSchema
// admin schemas
export const createTripBodySchema = z.object({
	route_id: z.string().trim().min(1, 'route_id là bắt buộc'),
	bus_id: z.string().trim().min(1, 'bus_id là bắt buộc'),
	driver_id: z.string().trim().min(1, 'driver_id là bắt buộc'),
	departure_time: z.string().trim().min(1, 'departure_time là bắt buộc'),
	arrival_time: z.string().trim().min(1, 'arrival_time là bắt buộc'),
	price: z.coerce.number().positive('price phải lớn hơn 0')
})
export const adminTripsQuerySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date phải có định dạng YYYY-MM-DD').optional(),
	status: z.enum(['SCHEDULED', 'DEPARTED', 'COMPLETED', 'CANCELLED']).optional(),
	routeId: z.string().trim().min(1).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10)
})
export const updateTripBodySchema = z.object({
	bus_id: z.string().trim().min(1).optional(),
	driver_id: z.string().trim().min(1).optional(),
	departure_time: z.string().trim().min(1).optional(),
	arrival_time: z.string().trim().min(1).optional(),
	price: z.coerce.number().positive('price phải lớn hơn 0').optional()
})
export const changeTripStatusBodySchema = z.object({
	status: z.enum(['DEPARTED', 'COMPLETED'])
})
export const driverTripsQuerySchema = z.object({
	userId: z.string().trim().min(1, 'userId là bắt buộc'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date phải có định dạng YYYY-MM-DD').optional()
})

export type SearchTripsQuery = z.infer<typeof searchTripsQuerySchema>
export type CreateTripBody = z.infer<typeof createTripBodySchema>
export type AdminTripsQuery = z.infer<typeof adminTripsQuerySchema>
export type UpdateTripBody = z.infer<typeof updateTripBodySchema>
export type ChangeTripStatusBody = z.infer<typeof changeTripStatusBodySchema>
export type DriverTripsQuery = z.infer<typeof driverTripsQuerySchema>
export type TripSeatsParams = z.infer<typeof tripSeatsParamsSchema>


