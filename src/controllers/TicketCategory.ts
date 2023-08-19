import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (request: Request, response: Response) => {
	const { name, childrenName, defaultText, companyId } = request.body;

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

		const createTicketCategory = await prisma.ticketCategory.create({
			data: {
				name,
				childrenName,
				defaultText,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Ticket category created successfully',
			body: createTicketCategory,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/', async (request: Request, response: Response) => {
	const { companyId } = request.query;

	if (!companyId || typeof companyId !== 'string') {
		return response.status(400).json({
			message: 'Company ID is required and must be a string.',
			error: true,
		});
	}

	try {
		const getAllTicketCategory = await prisma.ticketCategory.findMany({
			where: {
				companyId: companyId,
			},
		});

		const addedResponse = (processedData: any, label: any) =>
			processedData.filter((d: any) => d.label === label);

		const processBankResponse = (data: any) => {
			const processedData = [];
			for (let d of data) {
				const temp = addedResponse(processedData, d.name);
				if (!!temp.length) {
					temp[0].options.push({
						id: d.id,
						label: d.name,
						value: d.childrenName,
						defaultText: d.defaultText,
						company: d.company,
					});
				} else {
					processedData.push({
						label: d.name,
						options: [
							{
								id: d.id,
								label: d.name,
								value: d.childrenName,
								defaultText: d.defaultText,
								company: d.company,
							},
						],
					});
				}
			}
			return processedData;
		};

		return response.status(200).json({
			message: 'Ticket category found',
			body: processBankResponse(getAllTicketCategory),
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
