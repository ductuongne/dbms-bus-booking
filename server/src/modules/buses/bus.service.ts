import { AppError } from '../../utils/app-error'
import {
	type CreateBusInput,
	type UpdateBusInput,
	type ChangeBusStatusInput,
	type CreateBusTypeInput,
	type UpdateBusTypeInput
} from './bus.schema'
import { busRepository } from './bus.repository'

export interface BusDto {
	id: string
	licensePlate: string
	typeId: string
	typeName: string
	totalSeats: number
	floors: number
	status: 'ACTIVE' | 'INACTIVE'
}

export interface SeatDto {
	id: string
	seatNumber: string
	floor: number
	seatType: 'NORMAL' | 'VIP' | 'SLEEPER'
	busId: string
}

export interface BusDetailDto extends BusDto {
	seats: SeatDto[]
}

export interface BusTypeDto {
	id: string
	name: string
	totalSeats: number
	floors: number
}

export class BusService {
	async getAllBuses(): Promise<BusDto[]> {
		const rows = await busRepository.getAllBuses()
		return rows.map((r) => ({
			id: r.bus_id,
			licensePlate: r.license_plate,
			typeId: r.type_id,
			typeName: r.bus_type_name,
			totalSeats: r.total_seats,
			floors: r.floors,
			status: r.status
		}))
	}

	async getBusById(busId: string): Promise<BusDetailDto> {
		const { bus, seats } = await busRepository.getBusById(busId)
		if (!bus) {
			throw new AppError(404, 'Không tìm thấy xe')
		}
		return {
			id: bus.bus_id,
			licensePlate: bus.license_plate,
			typeId: bus.type_id,
			typeName: bus.bus_type_name,
			totalSeats: bus.total_seats,
			floors: bus.floors,
			status: bus.status,
			seats: seats.map((s) => ({
				id: s.seat_id,
				seatNumber: s.seat_number,
				floor: s.floor,
				seatType: s.seat_type,
				busId: s.bus_id
			}))
		}
	}

	async createBus(input: CreateBusInput): Promise<BusDetailDto> {
		const busId = input.busId || `BUS-${Date.now().toString().slice(-4)}`
		const customSeatsJson = input.customSeats
			? JSON.stringify(
					input.customSeats.map((s) => ({
						seat_number: s.seatNumber,
						floor: s.floor,
						seat_type: s.seatType
					}))
			  )
			: null

		await busRepository.createBusWithSeats(
			busId,
			input.licensePlate,
			input.typeId,
			input.status,
			customSeatsJson
		)

		return this.getBusById(busId)
	}

	async updateBus(busId: string, input: UpdateBusInput): Promise<BusDto> {
		await busRepository.updateBus(
			busId,
			input.licensePlate,
			input.typeId,
			input.status
		)
		const detail = await this.getBusById(busId)
		return {
			id: detail.id,
			licensePlate: detail.licensePlate,
			typeId: detail.typeId,
			typeName: detail.typeName,
			totalSeats: detail.totalSeats,
			floors: detail.floors,
			status: detail.status
		}
	}

	async changeBusStatus(busId: string, input: ChangeBusStatusInput): Promise<void> {
		await busRepository.updateBusStatus(busId, input.status)
	}

	async deleteBus(busId: string): Promise<void> {
		await busRepository.deleteBus(busId)
	}

	async getSeatsByBusId(busId: string): Promise<SeatDto[]> {
		const rows = await busRepository.getSeatsByBusId(busId)
		return rows.map((r) => ({
			id: r.seat_id,
			seatNumber: r.seat_number,
			floor: r.floor,
			seatType: r.seat_type,
			busId: r.bus_id
		}))
	}

	async getAllBusTypes(): Promise<BusTypeDto[]> {
		const rows = await busRepository.getAllBusTypes()
		return rows.map((r) => ({
			id: r.type_id,
			name: r.name,
			totalSeats: r.total_seats,
			floors: r.floors
		}))
	}

	async getBusTypeById(typeId: string): Promise<BusTypeDto> {
		const row = await busRepository.getBusTypeById(typeId)
		if (!row) {
			throw new AppError(404, 'Không tìm thấy loại xe')
		}
		return {
			id: row.type_id,
			name: row.name,
			totalSeats: row.total_seats,
			floors: row.floors
		}
	}

	async createBusType(input: CreateBusTypeInput): Promise<BusTypeDto> {
		const typeId = input.typeId || `BT-${Date.now().toString().slice(-4)}`
		const row = await busRepository.createBusType(
			typeId,
			input.name,
			input.totalSeats,
			input.floors
		)
		return {
			id: row.type_id,
			name: row.name,
			totalSeats: row.total_seats,
			floors: row.floors
		}
	}

	async updateBusType(typeId: string, input: UpdateBusTypeInput): Promise<BusTypeDto> {
		const row = await busRepository.updateBusType(
			typeId,
			input.name,
			input.totalSeats,
			input.floors
		)
		return {
			id: row.type_id,
			name: row.name,
			totalSeats: row.total_seats,
			floors: row.floors
		}
	}

	async deleteBusType(typeId: string): Promise<void> {
		await busRepository.deleteBusType(typeId)
	}
}

export const busService = new BusService()
