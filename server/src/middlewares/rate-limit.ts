import rateLimit from 'express-rate-limit'

export const bookingRateLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 30,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: {
			message: 'Quá nhiều yêu cầu đặt vé, vui lòng thử lại sau 1 phút',
			statusCode: 429
		}
	}
})
