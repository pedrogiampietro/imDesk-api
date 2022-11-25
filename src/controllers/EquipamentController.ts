import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request: Request, response: Response) => {
	const { userId } = request.query
	const { name, model, serialNumber, patrimonyTag } = request.body

	try {
		const createEquipament = await prisma.equipaments.create({
			data: {
				name,
				model,
				serialNumber,
				patrimonyTag,
				userId: String(userId),
			},
		})

		return response.status(200).json({
			message: 'Equipament created successfully',
			body: createEquipament,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllEquipaments = await prisma.equipaments.findMany()

		return response.status(200).json({
			message: 'Equipament found',
			body: getAllEquipaments,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
