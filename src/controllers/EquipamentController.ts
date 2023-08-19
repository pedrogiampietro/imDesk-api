import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const { userId, companyId } = request.query;
	const { name, model, serialNumber, patrimonyTag, type } = request.body;

	if (!companyId) {
		return response.status(400).json({
			message: 'CompanyId é obrigatório para criar um equipamento',
			error: true,
		});
	}

	try {
		const createEquipament = await prisma.equipaments.create({
			data: {
				name,
				model,
				serialNumber,
				patrimonyTag,
				type,
				userId: String(userId),
				companyId: String(companyId),
			},
		});

		return response.status(200).json({
			message: 'Equipamento criado com sucesso',
			body: createEquipament,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/', async (request: Request, response: Response) => {
	const { companyId } = request.query;

	if (!companyId) {
		return response.status(400).json({
			message: 'CompanyId é obrigatório para buscar equipamentos',
			error: true,
		});
	}

	try {
		const getAllEquipaments = await prisma.equipaments.findMany({
			where: {
				companyId: String(companyId),
			},
		});

		return response.status(200).json({
			message: 'Equipamento encontrado',
			body: getAllEquipaments,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
