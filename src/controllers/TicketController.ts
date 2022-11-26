import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request, response) => {
	const {
		description,
		ticketType,
		ticketCategory,
		ticketPriority,
		ticketLocation,
	} = request.body

	try {
		const createTicket = await prisma.ticket.create({
			data: {
				title: 'mas vai sair',
			},
		})

		return response.status(200).json({})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
