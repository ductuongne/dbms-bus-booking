import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok', service: 'bus-management-api' })
})

app.listen(port, () => {
	console.log(`API listening on http://localhost:${port}`)
})
