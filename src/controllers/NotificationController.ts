import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/:userId', async (request: Request, response: Response) => {
	try {
		const { userId } = request.params;

		const notifications = await prisma.notification.findMany({
			where: {
				userId,
			},
			select: {
				id: true,
				createdAt: true,
				isRead: true,
				Ticket: {
					select: {
						id: true,
						description: true,
						User: {
							select: {
								id: true,
								name: true,
								avatarUrl: true,
							},
						},
					},
				},
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

router.post(
	'/mark-all-read/:userId',
	async (request: Request, response: Response) => {
		try {
			const { userId } = request.params;

			const updatedNotifications = await prisma.notification.updateMany({
				where: {
					userId: userId,
					isRead: false,
				},
				data: {
					isRead: true,
				},
			});

			return response.status(200).json({
				message: 'All notifications marked as read',
				body: updatedNotifications,
				error: false,
			});
		} catch (err) {
			return response.status(500).json({
				message: 'Error updating notifications',
				error: true,
				details: err,
			});
		}
	}
);

export default router;
