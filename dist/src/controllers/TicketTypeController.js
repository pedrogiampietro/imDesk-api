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
        const createTicketType = yield prisma.ticketType.create({
            data: {
                name: name,
                TicketTypeCompanies: {
                    create: companyIds.map((companyId) => ({
                        companyId: companyId,
                    })),
                },
            },
        });
        return response.status(200).json({
            message: "Ticket type created successfully",
            body: createTicketType,
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
            message: "CompanyId é obrigatório para buscar tipos de tickets",
            error: true,
        });
    }
    try {
        const getAllTicketTypes = yield prisma.ticketType.findMany({
            where: {
                TicketTypeCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
            include: {
                TicketTypeCompanies: true,
            },
        });
        return response.status(200).json({
            message: "Ticket types found",
            body: getAllTicketTypes,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/find-by-id/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.query;
    try {
        const getType = yield prisma.ticketType.findUnique({
            where: {
                id: String(id),
            },
        });
        return response.status(200).json({
            message: "Type found",
            body: getType,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.patch("/update-type/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const typeId = request.params.id;
    const { name, companyIds } = request.body;
    if (!typeId || !companyIds) {
        return response
            .status(400)
            .json("ID e Empresas são obrigatórios para atualização");
    }
    try {
        const type = yield prisma.ticketType.findUnique({
            where: { id: String(typeId) },
        });
        if (!type) {
            return response.status(404).json("Usuário não encontrado");
        }
        const updateType = yield prisma.ticketType.update({
            where: { id: String(typeId) },
            data: {
                name,
                TicketTypeCompanies: {
                    deleteMany: {},
                    create: companyIds.map((companyId) => ({
                        companyId,
                    })),
                },
            },
        });
        return response.status(200).json({
            message: "Type updated successfully",
            body: updateType,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
