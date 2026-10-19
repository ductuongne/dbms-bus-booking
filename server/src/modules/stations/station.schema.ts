import { z } from 'zod'

export const createStationSchema = z.object({
	stationId: z.string().optional(),
	name: z.string().min(1, 'Tên bến xe không được để trống'),
	provinceId: z.string().min(1, 'Tỉnh/thành phố không được để trống'),
	address: z.string().min(1, 'Địa chỉ bến xe không được để trống')
})

export const updateStationSchema = z.object({
	name: z.string().min(1, 'Tên bến xe không được để trống'),
	provinceId: z.string().min(1, 'Tỉnh/thành phố không được để trống'),
	address: z.string().min(1, 'Địa chỉ bến xe không được để trống')
})

export const stationIdParamSchema = z.object({
	id: z.string().min(1, 'Mã bến xe không hợp lệ')
})

export type CreateStationInput = z.infer<typeof createStationSchema>
export type UpdateStationInput = z.infer<typeof updateStationSchema>
