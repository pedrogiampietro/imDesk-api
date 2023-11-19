import { PrismaClient, Notification } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateNotificationInput {
	userId: string;
	ticketId: string;
	type: string;
}

// Crie uma nova notificação
export async function createNotification({
	userId,
	ticketId,
	type,
}: CreateNotificationInput): Promise<Notification> {
	const notification = await prisma.notification.create({
		data: {
			userId,
			ticketId,
			type,
		},
	});
	return notification;
}

// Busque notificações por usuário
export async function getNotificationsByUser(userId: string) {
	const notifications = await prisma.notification.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
	return notifications;
}
