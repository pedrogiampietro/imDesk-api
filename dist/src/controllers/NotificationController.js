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
router.post('/create', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, ticketId, type } = request.body;
        const notification = yield prisma.notification.create({
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
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get('/:userId', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = request.params;
        const notifications = yield prisma.notification.findMany({
            where: {
                userId,
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
exports.default = router;
