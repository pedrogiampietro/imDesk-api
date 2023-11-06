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
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = request.query;
    if (!ticketId || typeof ticketId !== "string") {
        return response.status(400).json({
            message: "CompanyId é obrigatório para buscar depósitos",
            error: true,
        });
    }
    try {
        const todos = yield prisma.todo.findMany({
            where: {
                ticketId,
            },
        });
        return response.status(200).json({
            message: "Todos receive successfully",
            body: todos,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { description, ticketId } = request.body;
        const todo = yield prisma.todo.create({
            data: {
                description,
                ticketId,
            },
        });
        return response.status(200).json({
            message: "Todo created successfully",
            body: todo,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = request.path;
        const { completed } = request.body;
        const serealizedId = id.replace("/", "");
        const todoo = yield prisma.todo.update({
            where: { id: serealizedId },
            data: {
                completed,
            },
        });
        return response.status(200).json({
            message: "Todo updated successfully",
            body: todoo,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.delete("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = request.path;
        const serealizedId = id.replace("/", "");
        const todoo = yield prisma.todo.delete({ where: { id: serealizedId } });
        return response.status(200).json({
            message: "Todo deleted successfully",
            body: todoo,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
