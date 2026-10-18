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

dotenv.config()

const app = express()

app.use(cors({ origin: env.CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok', service: 'bus-management-api' })
})

// Trips & Bookings API từ dev:
app.use('/api', appRouter)

// Core Auth & Management API:
// Dual-routing: Public (không cần JWT)
app.use('/api/public', publicRouter)

// Dual-routing: Private (bắt buộc JWT)
app.use('/api/private', verifyJWT, privateRouter)

// Admin Management Router (bảo vệ bởi verifyJWT + checkRole(['ADMIN']))
app.use('/api/private/admin', adminRouter)

// Driver Portal Router (bảo vệ bởi verifyJWT + checkRole(['DRIVER']))
app.use('/api/private/driver', driverRouter)

// Error Handler: PHẢI đặt CUỐI CÙNG sau tất cả routes
app.use(errorHandler)

app.listen(env.PORT, () => {
	console.log(`API listening on http://localhost:${env.PORT}`)
	startBookingCron()
})
