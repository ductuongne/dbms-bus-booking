import { sql } from '../../config/db'
import { executeQuery, executeSP } from '../../database/query'

export interface StationListRow {
	station_id: string
	station_name: string
	province_id: string
	province_name: string
	address: string
}

export interface ProvinceRow {
	province_id: string
	name: string
}

export class StationRepository {
	async getAllStations(provinceId?: string): Promise<StationListRow[]> {
		if (provinceId) {
			return executeQuery<StationListRow>(
				'SELECT station_id, station_name, province_id, province_name, address FROM dbo.vw_StationList WHERE province_id = @provinceId ORDER BY station_name ASC',
				{ provinceId: { type: sql.VarChar(50), value: provinceId } }
			)
		}
		return executeQuery<StationListRow>(
			'SELECT station_id, station_name, province_id, province_name, address FROM dbo.vw_StationList ORDER BY station_name ASC'
		)
	}

	async getStationById(stationId: string): Promise<StationListRow | null> {
		const rows = await executeQuery<StationListRow>(
			'SELECT station_id, station_name, province_id, province_name, address FROM dbo.vw_StationList WHERE station_id = @stationId',
			{ stationId: { type: sql.VarChar(50), value: stationId } }
		)
		return rows[0] ?? null
	}

	async createStation(
		stationId: string,
		name: string,
		provinceId: string,
		address: string
	): Promise<StationListRow> {
		const result = await executeSP<StationListRow>('dbo.sp_TaoTram', {
			station_id: { type: sql.VarChar(50), value: stationId },
			name: { type: sql.NVarChar(100), value: name },
			province_id: { type: sql.VarChar(50), value: provinceId },
			address: { type: sql.NVarChar(255), value: address }
		})
		const created = result.recordset[0]
		if (!created) {
			throw new Error('Failed to create station')
		}
		return created
	}

	async updateStation(
		stationId: string,
		name: string,
		provinceId: string,
		address: string
	): Promise<StationListRow> {
		const result = await executeSP<StationListRow>('dbo.sp_SuaTram', {
			station_id: { type: sql.VarChar(50), value: stationId },
			name: { type: sql.NVarChar(100), value: name },
			province_id: { type: sql.VarChar(50), value: provinceId },
			address: { type: sql.NVarChar(255), value: address }
		})
		const updated = result.recordset[0]
		if (!updated) {
			throw new Error('Failed to update station')
		}
		return updated
	}

	async deleteStation(stationId: string): Promise<void> {
		await executeSP('dbo.sp_XoaTram', {
			station_id: { type: sql.VarChar(50), value: stationId }
		})
	}

	async getAllProvinces(): Promise<ProvinceRow[]> {
		return executeQuery<ProvinceRow>(
			'SELECT province_id, name FROM dbo.provinces ORDER BY name ASC'
		)
	}
}

export const stationRepository = new StationRepository()
