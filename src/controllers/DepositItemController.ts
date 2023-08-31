import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import loggingService from '../services/loggingService';

const prisma = new PrismaClient();
const router = express.Router();

// Criação de um novo item
router.post('/items', async (request: Request, response: Response) => {
	const { name, depotId, quantity, category, cost } = request.body;
	const { userid } = request.headers;

	if (!name || !depotId || !quantity) {
		return response.status(400).json({
			message: 'Name, depotId e quantity são obrigatórios para criar um item',
			error: true,
		});
	}
	if (!userid || Array.isArray(userid)) {
		return response.status(400).json({
			message: 'User ID inválido',
			error: true,
		});
	}

	try {
		// Buscar depot pelo depotId
		const depot = await prisma.depot.findUnique({
			where: { id: depotId },
		});

		if (!depot) {
			return response.status(400).json({
				message: 'Depot não encontrado',
				error: true,
			});
		}

		const item = await prisma.depotItem.create({
			data: {
				name,
				depotId,
				quantity,
				category,
				cost,
			},
		});

		loggingService.logInventoryCreate(userid, name, quantity, depot.name);

		return response.status(200).json({
			message: 'Item criado com sucesso',
			body: item,
			error: false,
		});
	} catch (err) {
		console.log(err);
		return response.status(500).json(err);
	}
});

// Listagem de todos os itens de um depósito
router.get('/items', async (request: Request, response: Response) => {
	const { depotId } = request.query;

	if (!depotId || typeof depotId !== 'string') {
		return response.status(400).json({
			message: 'DepotId é obrigatório para buscar itens',
			error: true,
		});
	}

	try {
		const items = await prisma.depotItem.findMany({
			where: {
				depotId,
			},
		});
		return response.status(200).json({
			message: 'Itens encontrados',
			body: items,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Atualização de um item
router.put('/items/:id', async (request: Request, response: Response) => {
	const { id } = request.params;
	const { name, quantity: quantityNew, category } = request.body;
	const { userid } = request.headers;

	if (!userid || Array.isArray(userid)) {
		return response.status(400).json({
			message: 'User ID inválido',
			error: true,
		});
	}

	try {
		// Encontrar o item existente
		const existingItem = await prisma.depotItem.findUnique({
			where: {
				id,
			},
		});

		if (!existingItem) {
			return response.status(404).json({
				message: 'Item não encontrado',
				error: true,
			});
		}

		const quantityOld = existingItem.quantity;

		// Atualizar o item
		const updatedItem = await prisma.depotItem.update({
			where: {
				id,
			},
			data: {
				name,
				quantity: quantityNew,
				category,
			},
		});

		loggingService.logInventoryUpdate(
			userid,
			existingItem.name,
			quantityOld,
			quantityOld - quantityNew
		);

		return response.status(200).json({
			message: 'Item atualizado com sucesso',
			body: updatedItem,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

// Diminuir a quantidade do item consumido
router.put(
	'/items/quantity/:id',
	async (request: Request, response: Response) => {
		const { itemId, quantityNew, ticketId } = request.body;
		const { userid } = request.headers;

		if (!userid || Array.isArray(userid)) {
			return response.status(400).json({
				message: 'User ID inválido',
				error: true,
			});
		}

		try {
			// Encontrar o depósito e o item existente
			const existingDepositItem = await prisma.depotItem.findUnique({
				where: {
					id: itemId,
				},
			});

			if (!existingDepositItem) {
				return response.status(404).json({
					message: 'Item de Depósito não encontrado',
					error: true,
				});
			}

			const quantityOld = existingDepositItem.quantity;

			if (quantityNew > quantityOld) {
				return response.status(400).json({
					message:
						'A quantidade nova não pode ser maior que a quantidade atual',
					error: true,
				});
			}

			// Atualizar a quantidade do item
			const updatedItem = await prisma.depotItem.update({
				where: {
					id: itemId,
				},
				data: {
					quantity: quantityOld - quantityNew,
				},
			});

			const cost = existingDepositItem.cost * quantityNew;

			// Adicionar registro na tabela TicketItem
			const newTicketItem = await prisma.ticketItem.create({
				data: {
					ticketId,
					depotItemId: itemId,
					quantity: quantityNew,
					cost: cost,
				},
			});

			loggingService.logInventoryUpdate(
				userid,
				existingDepositItem.name,
				quantityOld,
				quantityOld - quantityNew
			);

			return response.status(200).json({
				message: 'Quantidade do item atualizada com sucesso',
				body: {
					updatedItem,
					newTicketItem,
				},
				error: false,
			});
		} catch (err) {
			return response.status(500).json(err);
		}
	}
);

// Deleção de um item
router.delete('/items/:id', async (request: Request, response: Response) => {
	const { id } = request.params;

	try {
		await prisma.depotItem.delete({
			where: {
				id,
			},
		});
		return response.status(200).json({
			message: 'Item deletado com sucesso',
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
