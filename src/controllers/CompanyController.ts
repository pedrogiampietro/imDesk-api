import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Create a company
router.post('/', async (request, response) => {
	const { name, address } = request.body;

	if (!name || !address) {
		return response
			.status(400)
			.json('O nome e o endereço são obrigatórios para criar uma empresa');
	}

	try {
		const newCompany = await prisma.company.create({
			data: {
				name,
				address,
			},
		});

		return response.status(201).json({
			message: 'Empresa criada com sucesso',
			newCompany,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Get all companies
router.get('/', async (_request, response) => {
	try {
		const companies = await prisma.company.findMany();

		return response.status(200).json({
			message: 'Empresas recuperadas com sucesso',
			companies,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Get a company by ID
router.get('/:id', async (request, response) => {
	const { id } = request.params;

	try {
		const company = await prisma.company.findUnique({
			where: {
				id: id,
			},
		});

		if (!company) {
			return response.status(404).json('Empresa não encontrada');
		}

		return response.status(200).json({
			message: 'Empresa recuperada com sucesso',
			body: company,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Update a company by ID
router.put('/:id', async (request, response) => {
	const { id } = request.params;
	const { name, address } = request.body;

	try {
		const updatedCompany = await prisma.company.update({
			where: {
				id: id,
			},
			data: {
				name,
				address,
			},
		});

		return response.status(200).json({
			message: 'Empresa atualizada com sucesso',
			body: updatedCompany,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
