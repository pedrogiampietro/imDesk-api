import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'

const prisma = new PrismaClient()
const router = express.Router()

interface IRequestCreateMaintenanceBody {
	name: string
	location: string
	serialNumber: string
	patrimony: string
	model: string
	nextDatePreventive: string
}

const addDays = (days: number, custom_date?: any) => {
	const date = custom_date ? dayjs(custom_date) : dayjs()
	return date.add(days, 'days').toDate()
}

router.post('/', async (request: Request, response: Response) => {
	const { name, location, model, patrimony, serialNumber, nextDatePreventive } =
		request.body as IRequestCreateMaintenanceBody

	try {
		const getSingleMaintence = await prisma.maintenance.findFirst({
			where: {
				name,
			},
		})

		if (getSingleMaintence) {
			return response.status(409).json({
				message: 'An equipment with that name already exists',
				body: null,
				error: true,
			})
		}

		const createMaintence = await prisma.maintenance.create({
			data: {
				name,
				location,
				model,
				patrimony,
				serialNumber,
				nextDatePreventive,
				preventiveCount: 0,
				correctiveCount: 0,
			},
		})

		return response.status(200).json({
			message: 'Maintenance created successfully',
			body: createMaintence,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllMaintence = await prisma.maintenance.findMany()

		return response.status(200).json({
			message: 'Showing List Maintenance successfully',
			body: getAllMaintence,
			error: false,
		})
	} catch (err) {
		return response.status(500).json(err)
	}
})

router.patch('/', async (request: Request, response: Response) => {
	const { id, description } = request.body as any

	if (!id) {
		return response.status(400).json({
			message: 'Missing id, please try again!',
			body: null,
			error: true,
		})
	}

	const getSingleEquipament = await prisma.maintenance.findFirst({
		where: {
			id,
		},
	})

	const findAndUpdateEquipament = await prisma.maintenance.update({
		where: {
			id,
		},
		data: {
			preventiveCount: {
				increment: 1,
			},
			nextDatePreventive: addDays(90, getSingleEquipament?.nextDatePreventive),
			previousDatePreventive: addDays(0),
			description,
		},
	})

	return response.status(201).json({
		message: 'Maintenance updated successfully',
		body: findAndUpdateEquipament,
		error: false,
	})
})

export default router
