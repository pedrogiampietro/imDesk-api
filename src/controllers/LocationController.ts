import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const { name, companyIds } = request.body;

	if (
		!name ||
		!companyIds ||
		!Array.isArray(companyIds) ||
		companyIds.length === 0
	) {
		return response.status(400).json({
			message: 'Name e companyIds são obrigatórios para criar uma localização',
			error: true,
		});
	}

	try {
		const createLocation = await prisma.locations.create({
			data: {
				name: name,
				LocationCompanies: {
					create: companyIds.map((companyId: string) => ({
						companyId,
					})),
				},
			},
		});

		return response.status(201).json({
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
	const pageAsString = String(request.query.page);
	const limitAsString = String(request.query.limit);
	const searchTerm = String(request.query.searchTerm || '').trim();

	if (!companyId || typeof companyId !== 'string') {
		return response.status(400).json({
			message: 'Company ID is required and must be a string.',
			error: true,
		});
	}
	const page = Number(pageAsString) || 1;
	const limit = Number(limitAsString) || 10;
	const offset = (page - 1) * limit;

	try {
		const whereClause = {
			LocationCompanies: {
				some: {
					companyId: companyId,
				},
			},
			...(searchTerm && {
				name: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			}),
		} as any;

		const totalLocations = await prisma.locations.count({
			where: whereClause,
		});

		const getAllLocation = await prisma.locations.findMany({
			where: whereClause,
			include: {
				LocationCompanies: true,
			},
			skip: offset,
			take: limit,
		});

		response.setHeader('x-total-count', totalLocations.toLocaleString());
		return response.status(200).json({
			message: 'Locations found',
			body: getAllLocation,
			currentPage: page,
			totalPages: Math.ceil(totalLocations / limit),
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/find-by-id/', async (request: Request, response: Response) => {
	const { id } = request.query;

	try {
		const getLocation = await prisma.locations.findUnique({
			where: {
				id: String(id),
			},
		});

		return response.status(200).json({
			message: 'Locations found',
			body: getLocation,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.patch('/update-location/:id', async (request, response) => {
	const locationId = request.params.id;

	const { name, companyIds } = request.body;

	if (!locationId || !companyIds) {
		return response
			.status(400)
			.json('ID e Empresas são obrigatórios para atualização');
	}

	try {
		const location = await prisma.locations.findUnique({
			where: { id: String(locationId) },
		});

		if (!location) {
			return response.status(404).json('Usuário não encontrado');
		}

		const updateUser = await prisma.locations.update({
			where: { id: String(locationId) },
			data: {
				name,
				LocationCompanies: {
					deleteMany: {},
					create: companyIds.map((companyId: any) => ({
						companyId,
					})),
				},
			},
		});

		return response.status(200).json({
			message: 'Locations updated successfully',
			body: updateUser,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
