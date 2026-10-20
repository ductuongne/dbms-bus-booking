import { AppError } from '../../utils/app-error'
import {
	type CreateStationInput,
	type UpdateStationInput
} from './station.schema'
import { stationRepository } from './station.repository'

export interface StationDto {
	id: string
	name: string
	provinceId: string
	provinceName: string
	address: string
}

export interface ProvinceDto {
	id: string
	name: string
}

export class StationService {
	async getAllStations(provinceId?: string): Promise<StationDto[]> {
		const rows = await stationRepository.getAllStations(provinceId)
		return rows.map((r) => ({
			id: r.station_id,
			name: r.station_name,
			provinceId: r.province_id,
			provinceName: r.province_name,
			address: r.address
		}))
	}

	async getStationById(stationId: string): Promise<StationDto> {
		const row = await stationRepository.getStationById(stationId)
		if (!row) {
			throw new AppError(404, 'Không tìm thấy bến xe')
		}
		return {
			id: row.station_id,
			name: row.station_name,
			provinceId: row.province_id,
			provinceName: row.province_name,
			address: row.address
		}
	}

	async createStation(input: CreateStationInput): Promise<StationDto> {
		const stationId = input.stationId || `STA-${Date.now().toString().slice(-4)}`
		const row = await stationRepository.createStation(
			stationId,
			input.name,
			input.provinceId,
			input.address
		)
		return {
			id: row.station_id,
			name: row.station_name,
			provinceId: row.province_id,
			provinceName: row.province_name,
			address: row.address
		}
	}

	async updateStation(stationId: string, input: UpdateStationInput): Promise<StationDto> {
		const row = await stationRepository.updateStation(
			stationId,
			input.name,
			input.provinceId,
			input.address
		)
		return {
			id: row.station_id,
			name: row.station_name,
			provinceId: row.province_id,
			provinceName: row.province_name,
			address: row.address
		}
	}

	async deleteStation(stationId: string): Promise<void> {
		await stationRepository.deleteStation(stationId)
	}

	async getAllProvinces(): Promise<ProvinceDto[]> {
		const rows = await stationRepository.getAllProvinces()
		return rows.map((r) => ({
			id: r.province_id,
			name: r.name
		}))
	}
}

export const stationService = new StationService()
