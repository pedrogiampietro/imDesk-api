"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsByUser = exports.createNotification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Crie uma nova notificação
function createNotification({ userId, ticketId, type, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const notification = yield prisma.notification.create({
            data: {
                userId,
                ticketId,
                type,
            },
        });
        return notification;
    });
}
exports.createNotification = createNotification;
// Busque notificações por usuário
function getNotificationsByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return notifications;
    });
}
exports.getNotificationsByUser = getNotificationsByUser;
