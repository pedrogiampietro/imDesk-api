import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/dashboard', async (request: Request, response: Response) => {
	try {
		const { userId } = request.body;

		const statusCounts = await prisma.ticket.groupBy({
			where: { userId },
			by: ['status'],
			_count: true,
		});

		const lateTicketsCount = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					lt: new Date(),
				},
			},
		});

		const newTicketsCount =
			statusCounts.find((item) => item.status === 'new')?._count || 0;
		const assignedTicketsCount =
			statusCounts.find((item) => item.status === 'assigned')?._count || 0;

		const categoryCounts = await prisma.ticket.groupBy({
			where: { userId },
			by: ['ticketCategoryId'],
			_count: true,
		});

		const priorityCounts = await prisma.ticket.groupBy({
			where: { userId },
			by: ['ticketPriorityId'],
			_count: true,
		});

		const recentTickets = await prisma.ticket.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			take: 5,
		});

		const allTickets = await prisma.ticket.count({
			where: { userId },
		});

		const ticketsToday = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					equals: new Date(),
				},
			},
		});

		const ticketsTomorrow = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					equals: new Date(new Date().setDate(new Date().getDate() + 1)),
				},
			},
		});

		const ticketsAfter = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					gte: new Date(new Date().setDate(new Date().getDate() + 2)),
				},
			},
		});

		return response.status(200).json({
			message: 'Dashboard data retrieved successfully',
			error: false,
			newTicketsCount,
			lateTicketsCount,
			assignedTicketsCount,
			statusCounts,
			categoryCounts,
			priorityCounts,
			recentTickets,
			dueDateService: {
				all: allTickets,
				today: ticketsToday,
				tomorrow: ticketsTomorrow,
				after: ticketsAfter,
			},
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.post('/os', async (request: Request, response: Response) => {
	try {
		const { userId, startDate, endDate } = request.body;
		const getUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		const adjustedStartDate = new Date(
			new Date(startDate).setUTCHours(0, 0, 0, 0)
		);
		const adjustedEndDate = new Date(
			new Date(endDate).setUTCHours(23, 59, 59, 999)
		);

		const openedOSCount = await prisma.ticket.count({
			where: {
				assignedTo: {
					equals: `${userId}-${getUser?.name}`,
				},
				createdAt: {
					gte: adjustedStartDate,
					lte: adjustedEndDate,
				},
			},
		});

		const closedOSCount = await prisma.ticket.count({
			where: {
				assignedTo: {
					equals: `${userId}-${getUser?.name}`,
				},
				closedAt: {
					gte: adjustedStartDate,
					lte: adjustedEndDate,
				},
			},
		});

		const tickets = await prisma.ticket.findMany({
			where: {
				assignedTo: {
					equals: `${userId}-${getUser?.name}`,
				},
				AND: [
					{
						createdAt: {
							gte: adjustedStartDate,
						},
					},
					{
						createdAt: {
							lte: adjustedEndDate,
						},
					},
				],
			},
			select: {
				id: true,
				ticketCategory: true,
				description: true,
				status: true,
				createdAt: true,
				closedAt: true,
				observationServiceExecuted: true,
			},
		});

		return response.status(200).json({
			openedOS: openedOSCount,
			closedOS: closedOSCount,
			tickets,
			error: false,
		});
	} catch (err: any) {
		console.error(`Error: ${err.message}`);
		return response.status(500).json({ error: true, message: err.message });
	}
});

export default router;
