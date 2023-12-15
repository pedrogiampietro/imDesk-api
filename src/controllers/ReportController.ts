import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import moment from 'moment';

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
			select: {
				id: true,
				description: true,
				ticketCategory: {
					select: {
						name: true,
						childrenName: true,
					},
				},
				User: {
					select: {
						name: true,
					},
				},
			},
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

		const closedTicketsCount = await prisma.ticket.count({
			where: {
				status: 'closed',
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
			closedTicketsCount,
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

router.get('/tickets-month', async (request: Request, response: Response) => {
	try {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();

		const startDate = new Date(year, month, 1);
		const endDate = new Date(year, month + 1, 0);

		const tickets = await prisma.ticket.findMany({
			select: {
				createdAt: true,
			},
			where: {
				createdAt: {
					gte: startDate,
					lte: endDate,
				},
			},
		});

		// Agrupar tickets por dia
		const ticketsPerDay = tickets.reduce((acc: any, ticket: any) => {
			const date = ticket.createdAt.toISOString().split('T')[0];
			if (!acc[date]) {
				acc[date] = 0;
			}
			acc[date]++;
			return acc;
		}, {});

		const totalTickets = Object.values(ticketsPerDay).reduce(
			(a: any, b: any) => a + b,
			0
		);

		return response.status(200).json({
			message: 'Tickets month retrieved successfully',
			error: false,
			body: {
				ticketsPerDay: ticketsPerDay,
				totalTickets: totalTickets,
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

router.get('/os/export', async (request: Request, response: Response) => {
	try {
		const { userId, format } = request.query;

		const startDateParam = request.query.startDate;
		const endDateParam = request.query.endDate;

		const isStartDateString = typeof startDateParam === 'string';
		const isEndDateString = typeof endDateParam === 'string';

		const getUser = await prisma.user.findUnique({
			where: { id: String(userId) },
		});

		const adjustedStartDate = isStartDateString
			? new Date(new Date(startDateParam).setUTCHours(0, 0, 0, 0))
			: new Date();
		const adjustedEndDate = isEndDateString
			? new Date(new Date(endDateParam).setUTCHours(23, 59, 59, 999))
			: new Date();

		const fields = [
			{
				label: 'ID',
				value: 'id',
			},
			{
				label: 'Categoria',
				value: (row: any) =>
					`${row.ticketCategory?.name} - ${row.ticketCategory?.childrenName}`,
			},
			{
				label: 'Descrição',
				value: 'description',
			},
			{
				label: 'Status',
				value: 'status',
			},
			{
				label: 'Data de Criação',
				value: (row: any) => formatDate(row.createdAt),
			},
			{
				label: 'Data de Fechamento',
				value: (row: any) => (row.closedAt ? formatDate(row.closedAt) : 'N/A'),
			},
		];

		function formatDate(dateStr: any) {
			const date = new Date(dateStr);
			return (
				date.toLocaleDateString('pt-BR') +
				' ' +
				date.toLocaleTimeString('pt-BR')
			);
		}

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

		if (format === 'csv') {
			const json2csvParser = new Parser({ fields });
			const csv = json2csvParser.parse(tickets);

			response.setHeader(
				'Content-disposition',
				'attachment; filename=report.csv'
			);
			response.set('Content-Type', 'text/csv');
			response.status(200).send(csv);
		} else {
			response.status(400).send('Formato de exportação não suportado');
		}
	} catch (err: any) {
		console.error(`Error: ${err.message}`);
		response.status(500).json({ error: true, message: err.message });
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
						{ timeEstimate: { not: null } }, // Tickets com estimativa de tempo definida
					],
				},
				select: {
					id: true,
					closedBy: true,
					closedAt: true,
					timeEstimate: true,
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
							ticket.timeEstimate &&
							ticket.closedAt &&
							new Date(ticket.closedAt) > new Date(ticket.timeEstimate)
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

router.get(
	'/calculate-man-hour',
	async (request: Request, response: Response) => {
		const { userId } = request.query;

		const getUser = (await prisma.user.findUnique({
			where: { id: String(userId) },
		})) as any;

		try {
			const tickets = await prisma.ticket.findMany({
				where: {
					assignedTo: {
						equals: `${userId}-${getUser?.name}`,
					},
					closedAt: { not: null },
				},
			});

			let totalManHours = 0;

			for (let i = 0; i < tickets.length; i++) {
				const ticket = tickets[i];

				const assignedAtIndex = ticket.assignedTo.findIndex((item) =>
					item.includes(String(userId))
				);

				if (assignedAtIndex !== -1) {
					const assignedAt = moment(ticket.assignedToAt[assignedAtIndex]);
					const closedTime = moment(ticket.closedAt);

					if (closedTime.isAfter(assignedAt)) {
						const timeDiff = closedTime.diff(assignedAt, 'hours');

						if (timeDiff > 0) {
							totalManHours += timeDiff;
						}
					}
				}
			}

			if (getUser) {
				if (getUser.hourlyRate && totalManHours) {
					const hourlyRate = getUser.hourlyRate / 160;
					const totalCost = totalManHours * hourlyRate;

					response.json({
						totalManHours: Number(totalManHours.toFixed(2)),
						hourlyRate: Number((hourlyRate * 5.26).toFixed(2)),
						totalCost: Number((totalCost * 5.26).toFixed(2)),
					});
				} else {
					response.status(500).json({ message: 'Dados inválidos' });
				}
			} else {
				response.status(404).json({ message: 'Usuário não encontrado' });
			}
		} catch (error) {
			response.status(500).json({ message: 'Erro interno do servidor' });
		}
	}
);

router.get(
	'/calculate-salary',
	async (request: Request, response: Response) => {
		const { userId } = request.query;

		const getUser = (await prisma.user.findUnique({
			where: { id: String(userId) },
		})) as any;

		try {
			if (getUser) {
				const salary = getUser.hourlyRate;
				const daysWorkedPerMonth = 15;
				const hoursWorkedPerDay = 12;
				const totalHoursWorkedPerMonth = daysWorkedPerMonth * hoursWorkedPerDay;

				const hourlyRate = salary / totalHoursWorkedPerMonth;
				const dailyEarnings = hourlyRate * hoursWorkedPerDay;
				const monthlyEarnings = dailyEarnings * daysWorkedPerMonth;

				response.json({
					hourlyRate,
					dailyEarnings,
					monthlyEarnings,
				});
			} else {
				response.status(404).json({ message: 'Usuário não encontrado' });
			}
		} catch (error) {
			console.error('Erro ao calcular o salário:', error);
			response.status(500).json({ message: 'Erro interno do servidor' });
		}
	}
);

router.get(
	'/calculate-real-earnings',
	async (request: Request, response: Response) => {
		const { userId } = request.query;

		const getUser = (await prisma.user.findUnique({
			where: { id: String(userId) },
		})) as any;

		try {
			if (getUser) {
				const salary = getUser.hourlyRate;
				const daysWorkedPerMonth = 15;
				const hoursWorkedPerDay = 12;
				const totalHoursWorkedPerMonth = daysWorkedPerMonth * hoursWorkedPerDay;

				const hourlyRate = salary / totalHoursWorkedPerMonth;

				const tickets = await prisma.ticket.findMany({
					where: {
						assignedTo: {
							equals: `${userId}-${getUser?.name}`,
						},
						closedAt: { not: null },
					},
				});

				let totalManHours = 0;

				for (let i = 0; i < tickets.length; i++) {
					const ticket = tickets[i];

					const assignedAtIndex = ticket.assignedTo.findIndex((item) =>
						item.includes(String(userId))
					);

					if (assignedAtIndex !== -1) {
						const assignedAt = moment(ticket.assignedToAt[assignedAtIndex]);
						const closedTime = moment(ticket.closedAt);

						if (closedTime.isAfter(assignedAt)) {
							const timeDiff = closedTime.diff(assignedAt, 'hours');

							if (timeDiff > 0) {
								totalManHours += timeDiff;
							}
						}
					}
				}

				const realEarnings = totalManHours * hourlyRate;

				response.json({
					hourlyRate,
					totalManHours,
					realEarnings,
				});
			} else {
				response.status(404).json({ message: 'Usuário não encontrado' });
			}
		} catch (error) {
			console.error('Erro ao calcular os ganhos reais:', error);
			response.status(500).json({ message: 'Erro interno do servidor' });
		}
	}
);

export default router;
