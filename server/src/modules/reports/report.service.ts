import {
	type OccupancyRow,
	type RevenueRow,
	type RouteRevenueRow,
	reportRepository
} from './report.repository'
import type { ReportRangeQuery, RevenueReportQuery } from './report.schema'

export interface RevenueReportResponse {
	from: string
	to: string
	group_by: string
	total_revenue: number
	total_payments: number
	items: { period: string; payment_count: number; total_revenue: number }[]
}

export interface RouteRevenueResponse {
	route_id: string
	departure_station: string
	arrival_station: string
	tickets_sold: number
	revenue: number
}

export interface OccupancyResponse {
	trip_id: string
	route_id: string
	departure_time: string
	trip_status: string
	license_plate: string
	total_seats: number
	sold_seats: number
	occupancy_percent: number
}

function formatDate(value: Date): string {
	const pad = (n: number): string => String(n).padStart(2, '0')
	return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

function formatLocalDateTime(value: Date): string {
	const pad = (n: number): string => String(n).padStart(2, '0')
	const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
	const time = `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
	return `${date}T${time}`
}

function mapRevenue(rows: RevenueRow[], query: RevenueReportQuery): RevenueReportResponse {
	const items = rows.map((row) => ({
		period: formatDate(row.period),
		payment_count: Number(row.payment_count),
		total_revenue: Number(row.total_revenue)
	}))

	return {
		from: query.from,
		to: query.to,
		group_by: query.group_by,
		total_revenue: items.reduce((sum, item) => sum + item.total_revenue, 0),
		total_payments: items.reduce((sum, item) => sum + item.payment_count, 0),
		items
	}
}

function mapRouteRevenue(row: RouteRevenueRow): RouteRevenueResponse {
	return {
		route_id: row.route_id,
		departure_station: row.departure_station,
		arrival_station: row.arrival_station,
		tickets_sold: Number(row.tickets_sold),
		revenue: Number(row.revenue)
	}
}

function mapOccupancy(row: OccupancyRow): OccupancyResponse {
	return {
		trip_id: row.trip_id,
		route_id: row.route_id,
		departure_time: formatLocalDateTime(row.departure_time),
		trip_status: row.trip_status,
		license_plate: row.license_plate,
		total_seats: Number(row.total_seats),
		sold_seats: Number(row.sold_seats),
		occupancy_percent: Number(row.occupancy_percent)
	}
}

export class ReportService {
	async getRevenueReport(query: RevenueReportQuery): Promise<RevenueReportResponse> {
		const rows = await reportRepository.getRevenue(query.from, query.to, query.group_by)
		return mapRevenue(rows, query)
	}

	async getRouteRevenueReport(query: ReportRangeQuery): Promise<RouteRevenueResponse[]> {
		const rows = await reportRepository.getRouteRevenue(query.from, query.to)
		return rows.map(mapRouteRevenue)
	}

	async getOccupancyReport(query: ReportRangeQuery): Promise<OccupancyResponse[]> {
		const rows = await reportRepository.getOccupancy(query.from, query.to)
		return rows.map(mapOccupancy)
	}
}

export const reportService = new ReportService()
