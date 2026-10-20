import cron from 'node-cron'
import { sql } from '../config/db'
import { env } from '../config/env'
import { executeSP } from '../database/query'

const BATCH_SIZE = 100

async function releaseExpiredBookings(): Promise<void> {
	try {
		const result = await executeSP<{ released: number }>('sp_GiaiPhongGheHetHan', {
			batchSize: { type: sql.Int, value: BATCH_SIZE }
		})

		const released = Number(result.recordset[0]?.released ?? 0)
		console.log(`[Cron] Released: ${released} expired bookings`)
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error)
		console.error(`[Cron] Giải phóng ghế hết hạn thất bại: ${reason}`)
	}
}

export function startBookingCron(): void {
	if (!env.CRON_ENABLED) {
		console.log('[Cron] Đã tắt qua CRON_ENABLED=false')
		return
	}

	cron.schedule('* * * * *', releaseExpiredBookings)
	console.log('[Cron] Đã lên lịch giải phóng ghế hết hạn mỗi phút')
}
