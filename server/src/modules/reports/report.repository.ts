import { sql } from '../../config/db'
import { executeSP } from '../../database/query'

export interface RevenueRow {
	period: Date
	payment_count: number
	total_revenue: number
}

export interface RouteRevenueRow {
	route_id: string
	departure_station: string
	arrival_station: string
	tickets_sold: number
	revenue: number
}

export interface OccupancyRow {
	trip_id: string
	route_id: string
	departure_time: Date
	trip_status: string
	license_plate: string
	total_seats: number
	sold_seats: number
	occupancy_percent: number
}

export class ReportRepository {
	async getRevenue(from: string, to: string, groupBy: string): Promise<RevenueRow[]> {
		const result = await executeSP<RevenueRow>('sp_BaoCaoDoanhThu', {
			from_date: { type: sql.Date, value: from },
			to_date: { type: sql.Date, value: to },
			group_by: { type: sql.VarChar(10), value: groupBy }
		})

		return result.recordset
	}

	async getRouteRevenue(from: string, to: string): Promise<RouteRevenueRow[]> {
		const result = await executeSP<RouteRevenueRow>('sp_BaoCaoDoanhThuTuyen', {
			from_date: { type: sql.Date, value: from },
			to_date: { type: sql.Date, value: to }
		})

		return result.recordset
	}

	async getOccupancy(from: string, to: string): Promise<OccupancyRow[]> {
		const result = await executeSP<OccupancyRow>('sp_BaoCaoLapDay', {
			from_date: { type: sql.Date, value: from },
			to_date: { type: sql.Date, value: to }
		})

		return result.recordset
	}
}

export const reportRepository = new ReportRepository()
