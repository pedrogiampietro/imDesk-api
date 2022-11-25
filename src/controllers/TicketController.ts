import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request, response) => {
	try {
		const createTicket = {}

		return response.status(200).json({})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
