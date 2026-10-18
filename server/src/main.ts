import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { publicRouter } from './modules/auth/auth.routes.js'
import { privateRouter } from './modules/auth/private.routes.js'
import { verifyJWT } from './middlewares/auth.middleware.js'
import { errorHandler } from './middlewares/error-handler.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok', service: 'bus-management-api' })
})

// Dual-routing: Public (không cần JWT)
app.use('/api/public', publicRouter)

// Dual-routing: Private (bắt buộc JWT)
app.use('/api/private', verifyJWT, privateRouter)

// Error Handler: PHẢI đặt CUỐI CÙNG sau tất cả routes
app.use(errorHandler)

app.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`)
})
