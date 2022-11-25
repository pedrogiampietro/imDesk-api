import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request: Request, response: Response) => {
	const { name } = request.body

	try {
		const createTicketPriority = await prisma.ticketPriority.create({
			data: {
				name: name,
			},
		})

		return response.status(200).json({
			message: 'Ticket priority created successfully',
			body: createTicketPriority,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllTicketPriority = await prisma.ticketPriority.findMany()

		return response.status(200).json({
			message: 'Ticket priority found',
			body: getAllTicketPriority,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
