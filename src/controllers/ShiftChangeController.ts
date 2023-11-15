import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const {
		date,
		responsibleUserId,
		temperatureControl,
		companyId,
		atribuidos,
		planejados,
		pendentes,
	} = request.body;

	try {
		const shiftChange = await prisma.shiftChange.create({
			data: {
				date,
				responsibleUserId,
				temperatureControl,
				ShiftChangeCompanies: {
					create: { companyId },
				},
			},
		});

		await prisma.shiftChange.update({
			where: { id: shiftChange.id },
			data: {
				ShiftChangeAssignedTicket: {
					connect: atribuidos
						.filter((t: any) => t.id)
						.map((ticket: any) => ({
							shiftChangeId_ticketId: {
								shiftChangeId: shiftChange.id,
								ticketId: ticket.id,
							},
						})),
				},
				ShiftChangePlannedTicket: {
					connect: planejados
						.filter((t: any) => t.id)
						.map((ticket: any) => ({
							shiftChangeId_ticketId: {
								shiftChangeId: shiftChange.id,
								ticketId: ticket.id,
							},
						})),
				},
				ShiftChangePendingTicket: {
					connect: pendentes
						.filter((t: any) => t.id)
						.map((ticket: any) => ({
							shiftChangeId_ticketId: {
								shiftChangeId: shiftChange.id,
								ticketId: ticket.id,
							},
						})),
				},
			},
		});

		return response.status(200).json({
			message: 'Shift Change created successfully',
			body: shiftChange,
			error: false,
		});
	} catch (err) {
		console.error('Error on creating Shift Change: ', err);
		return response
			.status(500)
			.json({ message: 'Internal server error', error: true });
	}
});

router.get('/', async (request: Request, response: Response) => {
	try {
		const shiftChanges = await prisma.shiftChange.findMany({
			include: {
				ShiftChangeCompanies: true,
				ResponsibleUser: true,
				ShiftChangeAssignedTicket: true,
				ShiftChangePendingTicket: true,
				ShiftChangePlannedTicket: true,
			},
		});

		console.log('shiftChanges', shiftChanges);

		return response.status(200).json({
			message: 'Shift Changes found',
			body: shiftChanges,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/:id', async (request: Request, response: Response) => {
	const id = request.params.id;

	try {
		const shiftChange = await prisma.shiftChange.findUnique({
			where: { id },
			include: {
				ShiftChangeCompanies: true,
				ResponsibleUser: true,
				ShiftChangeAssignedTicket: true,
				ShiftChangePendingTicket: true,
				ShiftChangePlannedTicket: true,
			},
		});

		return response.status(200).json({
			message: 'Shift Changes found',
			body: shiftChange,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.put('/:id', async (request: Request, response: Response) => {
	const id = request.params.id;
	const { date, responsibleUserId, temperatureControl } = request.body;

	try {
		const shiftChange = await prisma.shiftChange.update({
			where: { id },
			data: {
				date,
				responsibleUserId,
				temperatureControl,
			},
		});

		return response.status(200).json({
			message: 'Shift Change updated successfully',
			body: shiftChange,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.delete('/:id', async (request: Request, response: Response) => {
	const id = request.params.id;

	try {
		await prisma.shiftChange.delete({ where: { id } });

		return response.status(200).json({
			message: 'Shift Changes deleted successfully',
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
