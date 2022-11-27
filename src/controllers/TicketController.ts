import express, { application, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

interface IRequestBody {
	ticket_description: string
	ticket_type: string
	ticket_category: string
	ticket_priority: string
	ticket_location: string
}

interface IRequestQuery {
	userId: string
}

router.post('/', async (request: Request, response: Response) => {
	const {
		ticket_description,
		ticket_type,
		ticket_category,
		ticket_priority,
		ticket_location,
	} = request.body as IRequestBody
	const { userId } = request.query as unknown as IRequestQuery

	try {
		const createTicket = await prisma.ticket.create({
			data: {
				description: ticket_description,
				ticketType: ticket_type,
				ticketCategory: ticket_category,
				ticketLocation: ticket_location,
				ticketPriority: ticket_priority,
				status: 'new',
				assignedTo: [],
				equipaments: [],
				images: [],
				userId,
			},
		})

		return response.status(200).json({
			message: 'Ticket created successfully',
			body: createTicket,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllTickets = await prisma.ticket.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			take: 10,
			include: {
				ticketCategoryId: true,
				ticketLocationId: true,
				ticketPriorityId: true,
				ticketTypeId: true,
				User: true,
			},
		})

		return response.status(200).json({
			message: 'Ticket created successfully',
			body: getAllTickets,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
