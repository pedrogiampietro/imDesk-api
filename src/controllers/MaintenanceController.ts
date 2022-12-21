import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import moment from 'moment'

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

	const date = new Date(`${getSingleEquipament?.previousDatePreventive}`)

	const findAndUpdateEquipament = await prisma.maintenance.update({
		where: {
			id,
		},
		data: {
			preventiveCount: {
				increment: 1,
			},
			nextDatePreventive: date.setDate(date.getDate() + 90).toLocaleString(),
			previousDatePreventive:
				getSingleEquipament?.previousDatePreventive || new Date().toISOString(),
			description,
		},
	})

	console.log('findAndUpdateEquipament', findAndUpdateEquipament)
	return

	return response.status(201).json({
		message: 'Maintenance updated successfully',
		body: findAndUpdateEquipament,
		error: false,
	})
})

export default router