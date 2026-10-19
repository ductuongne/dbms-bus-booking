import { z } from 'zod'

export const routeStationItemSchema = z.object({
	stationId: z.string().min(1, 'Mã bến xe không được để trống'),
	stopOrder: z.number().int().min(1, 'Thứ tự dừng tối thiểu là 1')
})

export const createRouteSchema = z.object({
	routeId: z.string().optional(),
	departureStationId: z.string().min(1, 'Bến xuất phát không được để trống'),
	arrivalStationId: z.string().min(1, 'Bến đến không được để trống'),
	distanceKm: z.number().positive('Khoảng cách phải lớn hơn 0'),
	estimatedDuration: z.number().int().positive('Thời gian ước tính phải lớn hơn 0'),
	intermediateStations: z.array(routeStationItemSchema).optional()
})

export const updateRouteSchema = z.object({
	departureStationId: z.string().min(1, 'Bến xuất phát không được để trống'),
	arrivalStationId: z.string().min(1, 'Bến đến không được để trống'),
	distanceKm: z.number().positive('Khoảng cách phải lớn hơn 0'),
	estimatedDuration: z.number().int().positive('Thời gian ước tính phải lớn hơn 0'),
	intermediateStations: z.array(routeStationItemSchema).optional()
})

export const routeIdParamSchema = z.object({
	id: z.string().min(1, 'Mã tuyến đường không hợp lệ')
})

export type CreateRouteInput = z.infer<typeof createRouteSchema>
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>
export type RouteStationItemInput = z.infer<typeof routeStationItemSchema>
