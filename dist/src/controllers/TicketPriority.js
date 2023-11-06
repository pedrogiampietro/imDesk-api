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
router.post("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, companyIds } = request.body;
    if (!companyIds || companyIds.length === 0) {
        return response
            .status(400)
            .json({ message: "At least one Company ID is required.", error: true });
    }
    try {
        // Verifique se o ticketPriority com o nome fornecido já existe
        const existingTicketPriority = yield prisma.ticketPriority.findFirst({
            where: { name: name },
        });
        if (existingTicketPriority) {
            return response.status(400).json({
                message: "A ticket priority with this name already exists.",
                error: true,
            });
        }
        const createTicketPriority = yield prisma.ticketPriority.create({
            data: {
                name: name,
                TicketPriorityCompanies: {
                    create: companyIds.map((companyId) => ({
                        companyId: companyId,
                    })),
                },
            },
        });
        return response.status(200).json({
            message: "Ticket priority created successfully",
            body: createTicketPriority,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = request.query.companyId;
    if (!companyId || typeof companyId !== "string") {
        return response.status(400).json({
            message: "CompanyId é obrigatório para buscar prioridades de tickets",
            error: true,
        });
    }
    try {
        const getAllTicketPriority = yield prisma.ticketPriority.findMany({
            where: {
                TicketPriorityCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
        });
        return response.status(200).json({
            message: "Ticket priority found",
            body: getAllTicketPriority,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
