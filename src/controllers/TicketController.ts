import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

interface IRequestBody {
	ticket_description: string;
	ticket_type: string;
	ticket_category: string;
	ticket_priority: string;
	ticket_location: string;
}

interface IRequestQuery {
	userId: string;
}

interface ITicketResponseRequestBody {
	ticketId: string;
	userId: string;
	content: string;
	type: string;
}

router.post('/', async (request: Request, response: Response) => {
	try {
		const {
			ticket_description,
			ticket_type,
			ticket_category,
			ticket_priority,
			ticket_location,
		} = request.body as IRequestBody;

		const { userId } = request.query as unknown as IRequestQuery;

		const createTicket = await prisma.ticket.create({
			data: {
				description: ticket_description,
				ticketType: ticket_type,
				ticketCategory: ticket_category,
				ticketLocation: ticket_location,
				ticketPriority: ticket_priority,
				status: 'new',
				assignedTo: [],
				equipaments: [],
				images: [],
				userId,
			},
			include: {
				ticketCategoryId: true,
				ticketLocationId: true,
				ticketPriorityId: true,
				ticketTypeId: true,
				User: true,
			},
		});

		const ticketCategoryId = {
			id: createTicket.ticketCategoryId.id,
			name: createTicket.ticketCategoryId.name,
			childrenName: createTicket.ticketCategoryId.childrenName,
			defaultText: createTicket.ticketCategoryId.defaultText,
		};

		const ticketLocationId = {
			id: createTicket.ticketLocationId.id,
			name: createTicket.ticketLocationId.name,
		};

		const ticketPriorityId = {
			id: createTicket.ticketPriorityId.id,
			name: createTicket.ticketPriorityId.name,
		};

		const ticketTypeId = {
			id: createTicket.ticketTypeId.id,
			name: createTicket.ticketTypeId.name,
		};

		const User = {
			id: createTicket.User?.id,
			username: createTicket.User?.username,
			name: createTicket.User?.name,
			email: createTicket.User?.email,
			password: createTicket.User?.password,
			phone: createTicket.User?.phone,
			ramal: createTicket.User?.ramal,
			sector: createTicket.User?.sector,
			createdAt: createTicket.User?.createdAt,
			updatedAt: createTicket.User?.updatedAt,
		};

		const responseObj = {
			id: createTicket.id,
			description: createTicket.description,
			ticketType: createTicket.ticketType,
			ticketCategory: createTicket.ticketCategory,
			ticketPriority: createTicket.ticketPriority,
			ticketLocation: createTicket.ticketLocation,
			assignedTo: createTicket.assignedTo,
			equipaments: createTicket.equipaments,
			images: createTicket.images,
			assignedToAt: createTicket.assignedToAt,
			closedBy: createTicket.closedBy,
			closedAt: createTicket.closedAt,
			status: createTicket.status,
			timeEstimate: createTicket.timeEstimate,
			isDelay: createTicket.isDelay,
			userId: createTicket.userId,
			createdAt: createTicket.createdAt,
			updatedAt: createTicket.updatedAt,
			ticketCategoryId,
			ticketLocationId,
			ticketPriorityId,
			ticketTypeId,
			User,
		};

		return response.status(200).json({
			message: 'Ticket created successfully',
			body: responseObj,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/', async (request: Request, response: Response) => {
	try {
		const getAllTickets = await prisma.ticket.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			take: 10,
			include: {
				ticketCategoryId: true,
				ticketLocationId: true,
				ticketPriorityId: true,
				ticketTypeId: true,
				User: true,
			},
		});

		return response.status(200).json({
			message: 'Ticket created successfully',
			body: getAllTickets,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.put('/:id', async (request: Request, response: Response) => {
	try {
		const ticketId = request.params.id;

		console.log('Ticket ID:', ticketId);

		const {
			description,
			ticketTypeId,
			ticketCategoryId,
			ticketLocationId,
			ticketPriorityId,
			assignedTo,
			equipaments,
			images,
			status,
			userId,
			timeEstimate,
			isDelay,
		} = request.body;

		console.log('Request Body:', request.body);

		const tech = await prisma.user.findUnique({
			where: { id: assignedTo.id },
		});

		if (!tech) {
			throw new Error(`Technician with id ${assignedTo.name} not found.`);
		}

		const techData = `${assignedTo.id}-${tech.name}`;

		const updatedTicket = await prisma.ticket.update({
			where: { id: ticketId },
			data: {
				description,
				ticketType: ticketTypeId,
				ticketCategory: ticketCategoryId,
				ticketLocation: ticketLocationId,
				ticketPriority: ticketPriorityId,
				assignedTo: techData,
				equipaments,
				images,
				status,
				User: userId,
				timeEstimate,
				isDelay,
			},
			include: {
				ticketCategoryId: true,
				ticketLocationId: true,
				ticketPriorityId: true,
				ticketTypeId: true,
				User: true,
			},
		});

		return response.status(200).json({
			message: 'Ticket updated successfully',
			body: updatedTicket,
			error: false,
		});
	} catch (err) {
		console.error('Error occurred:', err);

		return response.status(500).json(err);
	}
});

router.post('/response', async (request: Request, response: Response) => {
	try {
		const { ticketId, userId, content, type } =
			request.body as ITicketResponseRequestBody;

		const ticketResponse = await prisma.ticketResponse.create({
			data: {
				content: content,
				type: type,
				User: {
					connect: {
						id: userId, // use the userId here
					},
				},
				Ticket: {
					connect: {
						id: ticketId,
					},
				},
			},
		});

		return response.status(200).json({
			message: 'Response added successfully',
			body: ticketResponse,
			error: false,
		});
	} catch (err: any) {
		console.error('Error while creating ticket response:', err.message);
		return response.status(500).json({ message: 'Internal Server Error' });
	}
});

router.get('/:id/responses', async (request: Request, response: Response) => {
	try {
		const ticketId = request.params.id;

		const ticketResponses = await prisma.ticketResponse.findMany({
			where: {
				ticketId: ticketId,
			},
			include: {
				User: true,
			},
		});

		return response.status(200).json({
			message: 'Fetched ticket responses successfully',
			body: ticketResponses,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
