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
		const createTicketType = await prisma.ticketType.create({
			data: {
				name: name,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Ticket type created successfully',
			body: createTicketType,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});
router.get('/', async (request: Request, response: Response) => {
	const companyId = request.query.companyId;

	if (!companyId || typeof companyId !== 'string') {
		return response
			.status(400)
			.json({ message: 'Company ID is required.', error: true });
	}

	try {
		const getAllTicketType = await prisma.ticketType.findMany({
			where: {
				companyId,
			},
		});

		return response.status(200).json({
			message: 'Ticket type found',
			body: getAllTicketType,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
