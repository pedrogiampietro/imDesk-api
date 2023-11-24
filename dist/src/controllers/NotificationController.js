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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get('/:userId', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = request.params;
        const notifications = yield prisma.notification.findMany({
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
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post('/mark-as-read', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = request.body;
        const updatedNotification = yield prisma.notification.update({
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
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post('/mark-all-read/:userId', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = request.params;
        const updatedNotifications = yield prisma.notification.updateMany({
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
    }
    catch (err) {
        return response.status(500).json({
            message: 'Error updating notifications',
            error: true,
            details: err,
        });
    }
}));
exports.default = router;
