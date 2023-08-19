import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const { name, companyId } = request.body;

	if (!companyId) {
		return response
			.status(400)
			.json({ message: 'Company ID is required.', error: true });
	}

	try {
		const createTicketPriority = await prisma.ticketPriority.create({
			data: {
				name: name,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Ticket priority created successfully',
			body: createTicketPriority,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/', async (request: Request, response: Response) => {
	const companyId = request.query.companyId;

	if (!companyId || typeof companyId !== 'string') {
		return response.status(400).json({
			message: 'CompanyId é obrigatório para criar uma localização',
			error: true,
		});
	}

	try {
		const getAllTicketPriority = await prisma.ticketPriority.findMany({
			where: {
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Ticket priority found',
			body: getAllTicketPriority,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
