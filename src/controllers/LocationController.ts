import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (request: Request, response: Response) => {
	const { name } = request.body

	try {
		const createEquipament = await prisma.locations.create({
			data: {
				name: name,
			},
		})

		return response.status(200).json({
			message: 'Location created successfully',
			body: createEquipament,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllLocation = await prisma.locations.findMany()

		return response.status(200).json({
			message: 'Locations found',
			body: getAllLocation,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

export default router
