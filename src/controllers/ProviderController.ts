import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const { providerId, file, startDate, endDate, companyId } = request.body;

	try {
		const company = await prisma.company.findFirst({
			where: { id: companyId },
		});

		if (!company) {
			return response.status(404).json({
				message: 'Company not found',
				body: null,
				error: true,
			});
		}

		const createContract = await prisma.contract.create({
			data: {
				providerId: providerId,
				file: file,
				startDate: startDate,
				endDate: endDate,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Contract created successfully',
			body: createContract,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllContracts = await prisma.contract.findMany({
			include: {
				Company: true,
			},
		});

		return response.status(200).json({
			message: 'Contracts found',
			body: getAllContracts,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
