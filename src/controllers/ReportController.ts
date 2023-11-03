import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

interface SLAViolationsByTechnician {
	[technicianId: string]: {
		slaViolationsCount: number;
	};
}

router.get('/dashboard', async (request: Request, response: Response) => {
	try {
		const { userId } = request.body;

		const openStatuses = ['new', 'assigned'];

		const statusCounts = await prisma.ticket.groupBy({
			where: {
				userId,
				status: { in: openStatuses },
			},
			by: ['status'],
			_count: true,
		});

		const lateTicketsCount = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					lt: new Date(),
				},
				status: { in: openStatuses },
			},
		});

		const newTicketsCount =
			statusCounts.find((item) => item.status === 'new')?._count || 0;
		const assignedTicketsCount =
			statusCounts.find((item) => item.status === 'assigned')?._count || 0;

		const categoryCounts = await prisma.ticket.groupBy({
			where: {
				userId,
				status: { in: openStatuses },
			},
			by: ['ticketCategoryId'],
			_count: true,
		});

		const priorityCounts = await prisma.ticket.groupBy({
			where: {
				userId,
				status: { in: openStatuses },
			},
			by: ['ticketPriorityId'],
			_count: true,
		});

		const recentTickets = await prisma.ticket.findMany({
			where: {
				userId,
				status: { in: openStatuses },
			},
			orderBy: { createdAt: 'desc' },
			take: 5,
		});

		const allTickets = await prisma.ticket.count({
			where: {
				userId,
				status: { in: openStatuses },
			},
		});

		const ticketsToday = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					equals: new Date(),
				},
				status: { in: openStatuses },
			},
		});

		const ticketsTomorrow = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					equals: new Date(new Date().setDate(new Date().getDate() + 1)),
				},
				status: { in: openStatuses },
			},
		});

		const ticketsAfter = await prisma.ticket.count({
			where: {
				userId,
				timeEstimate: {
					gte: new Date(new Date().setDate(new Date().getDate() + 2)),
				},
				status: { in: openStatuses },
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

router.get('/os', async (request: Request, response: Response) => {
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

router.get(
	'/open-tickets-by-location',
	async (request: Request, response: Response) => {
		try {
			// Obtém todos os tickets que estão abertos, agrupados por localização
			const openTicketsCountByLocation = await prisma.ticket.groupBy({
				by: ['ticketLocationId'],
				_count: {
					id: true,
				},
				where: {
					status: {
						in: ['new', 'assigned', 'closed'],
					},
				},
			});

			const openTicketsWithLocationNames = await Promise.all(
				openTicketsCountByLocation.map(async (location) => {
					const locationInfo = await prisma.locations.findUnique({
						where: { id: location.ticketLocationId },
						select: { name: true },
					});
					return {
						locationName: locationInfo?.name,
						openTicketsCount: location._count.id,
					};
				})
			);

			return response.status(200).json({
				body: openTicketsWithLocationNames,
				message: '',
				error: false,
			});
		} catch (err: any) {
			return response.status(500).json({ error: true, message: err.message });
		}
	}
);

router.get(
	'/sla-violations-by-technician',
	async (request: Request, response: Response) => {
		try {
			// Buscar todos os tickets que estão fechados
			const closedTickets = await prisma.ticket.findMany({
				where: {
					closedAt: {
						not: null,
					},
					OR: [
						{ slaViolated: true },
						{ timeEstimate: { not: null } }, // Tickets com estimativa de tempo definida
					],
				},
				select: {
					id: true,
					closedBy: true,
					closedAt: true,
					timeEstimate: true,
					slaViolated: true,
				},
			});

			// Filtrar os tickets que violaram o SLA com base nas condições especificadas
			const slaViolationsByTechnician =
				closedTickets.reduce<SLAViolationsByTechnician>((acc, ticket) => {
					const technicianId = ticket.closedBy;
					if (technicianId) {
						if (!acc[technicianId]) {
							acc[technicianId] = { slaViolationsCount: 0 };
						}
						// Checar se o SLA foi violado ou se o ticket foi fechado após o tempo estimado
						if (
							ticket.slaViolated ||
							(ticket.timeEstimate &&
								ticket.closedAt &&
								new Date(ticket.closedAt) > new Date(ticket.timeEstimate))
						) {
							acc[technicianId].slaViolationsCount++;
						}
					}
					return acc;
				}, {});

			return response.status(200).json({
				body: slaViolationsByTechnician,
				message: 'SLA violations by technician retrieved successfully.',
				error: false,
			});
		} catch (err: any) {
			return response.status(500).json({ error: true, message: err.message });
		}
	}
);

export default router;
