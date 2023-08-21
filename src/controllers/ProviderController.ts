import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Criar um novo provedor
router.post('/provider', async (request: Request, response: Response) => {
	const { name, phone, email, address } = request.body;

	try {
		const provider = await prisma.provider.create({
			data: {
				name: name,
				phone: phone,
				email: email,
				address: address,
			},
		});

		return response.status(200).json({
			message: 'Provider created successfully',
			body: provider,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Adicionar um novo serviço a um provedor específico
router.post('/service', async (request: Request, response: Response) => {
	const { providerId, name, price, companyId } = request.body;

	try {
		const service = await prisma.service.create({
			data: {
				providerId: providerId,
				name: name,
				price: price,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Service added successfully',
			body: service,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Adicionar um novo contrato a um provedor específico
router.post('/contract', async (request: Request, response: Response) => {
	const { providerId, file, startDate, endDate, companyId } = request.body;

	try {
		const contract = await prisma.contract.create({
			data: {
				providerId: providerId,
				file: file,
				startDate: startDate,
				endDate: endDate,
				companyId: companyId,
			},
		});

		return response.status(200).json({
			message: 'Contract added successfully',
			body: contract,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/contract', async (request: Request, response: Response) => {
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
