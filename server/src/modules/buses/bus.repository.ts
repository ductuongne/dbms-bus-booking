import { sql } from '../../config/db'
import { executeQuery, executeSP } from '../../database/query'

export interface BusListRow {
	bus_id: string
	license_plate: string
	type_id: string
	bus_type_name: string
	total_seats: number
	floors: number
	status: 'ACTIVE' | 'INACTIVE'
}

export interface BusDetailRow {
	bus_id: string
	license_plate: string
	type_id: string
	bus_type_name: string
	total_seats: number
	floors: number
	status: 'ACTIVE' | 'INACTIVE'
}

export interface SeatRow {
	seat_id: string
	seat_number: string
	floor: number
	seat_type: 'NORMAL' | 'VIP' | 'SLEEPER'
	bus_id: string
}

export interface BusTypeRow {
	type_id: string
	name: string
	total_seats: number
	floors: number
}

export class BusRepository {
	async getAllBuses(): Promise<BusListRow[]> {
		return executeQuery<BusListRow>(
			'SELECT bus_id, license_plate, type_id, bus_type_name, total_seats, floors, status FROM dbo.vw_BusList ORDER BY bus_id ASC'
		)
	}

	async getBusById(busId: string): Promise<{ bus: BusDetailRow | null; seats: SeatRow[] }> {
		const result = await executeSP<BusDetailRow>('dbo.sp_LayChiTietXe', {
			bus_id: { type: sql.VarChar(50), value: busId }
		})

		const bus = result.recordsets[0]?.[0] ?? null
		const seats = (result.recordsets[1] as unknown as SeatRow[]) ?? []
		return { bus, seats }
	}

	async createBusWithSeats(
		busId: string,
		licensePlate: string,
		typeId: string,
		status: string,
		customSeatsJson: string | null
	): Promise<void> {
		await executeSP('dbo.sp_TaoXeVaTaoGhe', {
			bus_id: { type: sql.VarChar(50), value: busId },
			license_plate: { type: sql.VarChar(20), value: licensePlate },
			type_id: { type: sql.VarChar(50), value: typeId },
			status: { type: sql.VarChar(20), value: status },
			custom_seats: { type: sql.NVarChar(sql.MAX), value: customSeatsJson }
		})
	}

	async updateBus(
		busId: string,
		licensePlate: string,
		typeId: string,
		status: string
	): Promise<void> {
		await executeSP('dbo.sp_SuaXe', {
			bus_id: { type: sql.VarChar(50), value: busId },
			license_plate: { type: sql.VarChar(20), value: licensePlate },
			type_id: { type: sql.VarChar(50), value: typeId },
			status: { type: sql.VarChar(20), value: status }
		})
	}

	async updateBusStatus(busId: string, status: string): Promise<void> {
		await executeSP('dbo.sp_DoiTrangThaiXe', {
			bus_id: { type: sql.VarChar(50), value: busId },
			status: { type: sql.VarChar(20), value: status }
		})
	}

	async deleteBus(busId: string): Promise<void> {
		await executeSP('dbo.sp_XoaXe', {
			bus_id: { type: sql.VarChar(50), value: busId }
		})
	}

	async getSeatsByBusId(busId: string): Promise<SeatRow[]> {
		const result = await executeSP<SeatRow>('dbo.sp_LaySoDoGheXe', {
			bus_id: { type: sql.VarChar(50), value: busId }
		})
		return result.recordset
	}

	async getAllBusTypes(): Promise<BusTypeRow[]> {
		return executeQuery<BusTypeRow>(
			'SELECT type_id, name, total_seats, floors FROM dbo.bus_types ORDER BY name ASC'
		)
	}

	async getBusTypeById(typeId: string): Promise<BusTypeRow | null> {
		const rows = await executeQuery<BusTypeRow>(
			'SELECT type_id, name, total_seats, floors FROM dbo.bus_types WHERE type_id = @typeId',
			{ typeId: { type: sql.VarChar(50), value: typeId } }
		)
		return rows[0] ?? null
	}

	async createBusType(
		typeId: string,
		name: string,
		totalSeats: number,
		floors: number
	): Promise<BusTypeRow> {
		const result = await executeSP<BusTypeRow>('dbo.sp_TaoLoaiXe', {
			type_id: { type: sql.VarChar(50), value: typeId },
			name: { type: sql.NVarChar(50), value: name },
			total_seats: { type: sql.Int, value: totalSeats },
			floors: { type: sql.Int, value: floors }
		})
		const created = result.recordset[0]
		if (!created) {
			throw new Error('Failed to create bus type')
		}
		return created
	}

	async updateBusType(
		typeId: string,
		name: string,
		totalSeats: number,
		floors: number
	): Promise<BusTypeRow> {
		const result = await executeSP<BusTypeRow>('dbo.sp_SuaLoaiXe', {
			type_id: { type: sql.VarChar(50), value: typeId },
			name: { type: sql.NVarChar(50), value: name },
			total_seats: { type: sql.Int, value: totalSeats },
			floors: { type: sql.Int, value: floors }
		})
		const updated = result.recordset[0]
		if (!updated) {
			throw new Error('Failed to update bus type')
		}
		return updated
	}

	async deleteBusType(typeId: string): Promise<void> {
		await executeSP('dbo.sp_XoaLoaiXe', {
			type_id: { type: sql.VarChar(50), value: typeId }
		})
	}
}

export const busRepository = new BusRepository()
