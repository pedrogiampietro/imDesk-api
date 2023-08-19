import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const { name, companyId } = request.body;

	if (!companyId || typeof companyId !== 'string') {
		return response.status(400).json({
			message: 'CompanyId é obrigatório para criar uma localização',
			error: true,
		});
	}

	try {
		const createLocation = await prisma.locations.create({
			data: {
				name: name,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Location created successfully',
			body: createLocation,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/', async (request: Request, response: Response) => {
	const { companyId } = request.query;

	if (!companyId || typeof companyId !== 'string') {
		return response.status(400).json({
			message: 'Company ID is required and must be a string.',
			error: true,
		});
	}

	try {
		const getAllLocation = await prisma.locations.findMany({
			where: {
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Locations found',
			body: getAllLocation,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
