import { z } from 'zod'

export const seatSchema = z.object({
	seatNumber: z.string().min(1, 'Số ghế không được để trống'),
	floor: z.number().int().min(1).max(2),
	seatType: z.enum(['NORMAL', 'VIP', 'SLEEPER'])
})

export const createBusSchema = z.object({
	busId: z.string().optional(),
	licensePlate: z.string().min(1, 'Biển số xe không được để trống'),
	typeId: z.string().min(1, 'Loại xe không được để trống'),
	status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
	customSeats: z.array(seatSchema).optional()
})

export const updateBusSchema = z.object({
	licensePlate: z.string().min(1, 'Biển số xe không được để trống'),
	typeId: z.string().min(1, 'Loại xe không được để trống'),
	status: z.enum(['ACTIVE', 'INACTIVE'])
})

export const changeBusStatusSchema = z.object({
	status: z.enum(['ACTIVE', 'INACTIVE'])
})

export const busIdParamSchema = z.object({
	id: z.string().min(1, 'ID xe không hợp lệ')
})

export const createBusTypeSchema = z.object({
	typeId: z.string().optional(),
	name: z.string().min(1, 'Tên loại xe không được để trống'),
	totalSeats: z.number().int().min(1, 'Số ghế tối thiểu là 1').max(100, 'Số ghế tối đa là 100'),
	floors: z.number().int().min(1).max(2)
})

export const updateBusTypeSchema = z.object({
	name: z.string().min(1, 'Tên loại xe không được để trống'),
	totalSeats: z.number().int().min(1, 'Số ghế tối thiểu là 1').max(100, 'Số ghế tối đa là 100'),
	floors: z.number().int().min(1).max(2)
})

export const busTypeIdParamSchema = z.object({
	id: z.string().min(1, 'ID loại xe không hợp lệ')
})

export type CreateBusInput = z.infer<typeof createBusSchema>
export type UpdateBusInput = z.infer<typeof updateBusSchema>
export type ChangeBusStatusInput = z.infer<typeof changeBusStatusSchema>
export type CreateBusTypeInput = z.infer<typeof createBusTypeSchema>
export type UpdateBusTypeInput = z.infer<typeof updateBusTypeSchema>
