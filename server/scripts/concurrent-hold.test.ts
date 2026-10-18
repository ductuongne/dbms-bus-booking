const BASE_URL = 'http://localhost:3000/api/bookings/hold'
const TRIP_ID = 'TRP-01'
const TOTAL_REQUESTS = 20

const HOLD_BODY = {
	trip_id: TRIP_ID,
	passengers: [
		{ seat_id: 'SEA-21', name: 'Khách Đồng Thời A', phone: '0905555501' },
		{ seat_id: 'SEA-22', name: 'Khách Đồng Thời B', phone: '0905555502' }
	]
}

interface HoldAttempt {
	index: number
	status: number
	body: unknown
}

async function sendHoldRequest(index: number): Promise<HoldAttempt> {
	const response = await fetch(BASE_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(HOLD_BODY)
	})

	return { index, status: response.status, body: await response.json().catch(() => null) }
}

function getErrorMessage(body: unknown): string {
	if (typeof body !== 'object' || body === null || !('error' in body)) return ''
	const { error } = body
	if (typeof error !== 'object' || error === null || !('message' in error)) return ''
	const { message } = error
	return typeof message === 'string' ? message : ''
}

async function main(): Promise<void> {
	console.log('='.repeat(60))
	console.log('KIỂM THỬ ĐỒNG THỜI: 20 request POST /api/bookings/hold')
	console.log(`trip_id: ${TRIP_ID} | ghế: SEA-21, SEA-22 | customer_id: KHÔNG gửi (khách vãng lai)`)
	console.log('='.repeat(60))

	const startedAt = Date.now()
	const settled = await Promise.allSettled(
		Array.from({ length: TOTAL_REQUESTS }, (_, index) => sendHoldRequest(index))
	)
	const elapsedMs = Date.now() - startedAt

	const attempts = settled
		.filter((result): result is PromiseFulfilledResult<HoldAttempt> => result.status === 'fulfilled')
		.map((result) => result.value)
	const transportFailures = settled.filter((result) => result.status === 'rejected')

	const statusCounts = new Map<number, number>()
	for (const attempt of attempts) {
		statusCounts.set(attempt.status, (statusCounts.get(attempt.status) ?? 0) + 1)
	}

	const success = statusCounts.get(201) ?? 0
	const conflict = statusCounts.get(409) ?? 0

	console.log(`\nThời gian hoàn tất ${TOTAL_REQUESTS} request: ${elapsedMs} ms`)
	console.log('Phân bố HTTP status:')
	for (const [status, count] of [...statusCounts.entries()].sort((a, b) => a[0] - b[0])) {
		console.log(`  - ${status}: ${count}`)
	}
	if (transportFailures.length > 0) {
		console.log(`  - Lỗi kết nối (không nhận được status): ${transportFailures.length}`)
	}

	const winner = attempts.find((attempt) => attempt.status === 201)
	const failureSamples = [...new Set(attempts.filter((a) => a.status !== 201).map((a) => getErrorMessage(a.body)))]

	console.log(`\nBooking giữ chỗ thành công: ${JSON.stringify(winner?.body)}`)
	console.log(`Thông báo lỗi các request còn lại: ${JSON.stringify(failureSamples)}`)

	console.log('\n--- TÓM TẮT ---')
	console.log(`Thành công (201): ${success}`)
	console.log(`Thất bại   (409): ${conflict}`)

	const isPass = success === 1 && conflict === TOTAL_REQUESTS - 1
	console.log(
		isPass
			? '[PASS] Đúng 1 request giữ được ghế, 19 request còn lại bị chặn bằng 409'
			: `[FAIL] Kỳ vọng 1 x 201 và ${TOTAL_REQUESTS - 1} x 409`
	)

	process.exitCode = isPass ? 0 : 1
}

main().catch((error: unknown) => {
	console.error('Script lỗi:', error)
	process.exitCode = 1
})
