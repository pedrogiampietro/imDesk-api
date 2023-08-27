import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/create', async (request: Request, response: Response) => {
	try {
		const { userId, ticketId, type } = request.body;

		const notification = await prisma.notification.create({
			data: {
				userId,
				ticketId,
				type,
			},
		});

		return response.status(200).json({
			message: 'Notification created successfully',
			body: notification,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.get('/:userId', async (request: Request, response: Response) => {
	try {
		const { userId } = request.params;

		const notifications = await prisma.notification.findMany({
			where: {
				userId,
			},
		});

		return response.status(200).json({
			message: 'Notifications found',
			body: notifications,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

router.post('/mark-as-read', async (request: Request, response: Response) => {
	try {
		const { notificationId } = request.body;

		const updatedNotification = await prisma.notification.update({
			where: {
				id: notificationId,
			},
			data: {
				isRead: true,
			},
		});

		return response.status(200).json({
			message: 'Notification marked as read',
			body: updatedNotification,
			error: false,
		});
	} catch (err) {
		return response.status(500).json(err);
	}
});

export default router;
