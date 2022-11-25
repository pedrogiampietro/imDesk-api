import express, { Request, Response } from 'express'
import { PrismaClient, TicketCategory } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request: Request, response: Response) => {
	const { name, childrenName } = request.body

	try {
		const createTicketCategory = await prisma.ticketCategory.create({
			data: {
				name,
				childrenName,
			},
		})

		return response.status(200).json({
			message: 'Ticket category created successfully',
			body: createTicketCategory,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllTicketCategory = await prisma.ticketCategory.findMany()

		const groupBy = <T>(
			array: T[],
			predicate: (value: T, index: number, array: T[]) => string
		) =>
			array.reduce((acc, value, index, array) => {
				;(acc[predicate(value, index, array)] ||= []).push(value)
				return acc
			}, {} as { [key: string]: T[] })

		const grouped = groupBy(
			getAllTicketCategory,
			(category: any) => category.name
		)

		return response.status(200).json({
			message: 'Ticket category found',
			body: grouped,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
