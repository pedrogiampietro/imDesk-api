import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request: Request, response: Response) => {
	const { name } = request.body

	try {
		const createTicketType = await prisma.ticketType.create({
			data: {
				name: name,
			},
		})

		return response.status(200).json({
			message: 'Ticket type created successfully',
			body: createTicketType,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllTicketType = await prisma.ticketType.findMany()

		return response.status(200).json({
			message: 'Ticket type found',
			body: getAllTicketType,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
