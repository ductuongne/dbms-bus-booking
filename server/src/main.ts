import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { errorHandler } from './middlewares/error-handler'
import appRouter from './modules/index'

const app = express()

app.use(cors({ origin: env.CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok', service: 'bus-management-api' })
})

app.use('/api', appRouter)

app.use(errorHandler)

app.listen(env.PORT, () => {
	console.log(`API listening on http://localhost:${env.PORT}`)
})

