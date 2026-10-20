import { z } from 'zod'

const dateSchema = z
	.string()
	.trim()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo định dạng YYYY-MM-DD')
	.refine((value) => !Number.isNaN(Date.parse(value)), 'Ngày không hợp lệ')

export const reportRangeQuerySchema = z
	.object({
		from: dateSchema,
		to: dateSchema
	})
	.refine((query) => query.from <= query.to, {
		message: 'from phải nhỏ hơn hoặc bằng to',
		path: ['from']
	})

export const revenueReportQuerySchema = z
	.object({
		from: dateSchema,
		to: dateSchema,
		group_by: z.enum(['DAY', 'MONTH']).default('DAY')
	})
	.refine((query) => query.from <= query.to, {
		message: 'from phải nhỏ hơn hoặc bằng to',
		path: ['from']
	})

export type ReportRangeQuery = z.infer<typeof reportRangeQuerySchema>
export type RevenueReportQuery = z.infer<typeof revenueReportQuerySchema>
