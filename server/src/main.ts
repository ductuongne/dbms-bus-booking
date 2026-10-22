import './polyfills.js'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { env } from './config/env.js'
import { startBookingCron } from './jobs/booking.cron.js'
import { publicRouter } from './modules/auth/auth.routes.js'
import { privateRouter } from './modules/auth/private.routes.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { driverRouter } from './modules/driver/driver.routes.js'
import appRouter from './modules/index.js'
import { verifyJWT } from './middlewares/auth.middleware.js'
import { errorHandler } from './middlewares/error-handler.js'
import { requestContextMiddleware } from './database/context.js'

dotenv.config()

const app = express()

const allowedOrigins = [
	env.CLIENT_URL,
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:3000',
	'http://127.0.0.1:3000',
]

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				callback(null, true)
			}
		},
		credentials: true,
	})
)
app.use(express.json())
app.use(requestContextMiddleware)

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok', service: 'bus-management-api' })
})

// Routes nghiệp vụ chung (Trips, Bookings, Payments, Routes, Stations, Buses)
app.use('/api', appRouter)

// Public Auth API (không yêu cầu JWT token)
app.use('/api/public', publicRouter)

// Private Auth API (yêu cầu JWT token)
app.use('/api/private', verifyJWT, privateRouter)

// Admin Management API (yêu cầu quyền ADMIN)
app.use('/api/private/admin', adminRouter)

// Driver Portal API (yêu cầu quyền DRIVER)
app.use('/api/private/driver', driverRouter)

// Global Error Handler middleware (đặt cuối pipeline để bắt unhandled errors)
app.use(errorHandler)

app.listen(env.PORT, () => {
	console.log(`API listening on http://localhost:${env.PORT}`)
	startBookingCron()
})
