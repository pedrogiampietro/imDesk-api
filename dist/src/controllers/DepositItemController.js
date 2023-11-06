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
const loggingService_1 = __importDefault(require("../services/loggingService"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Criação de um novo item
router.post('/items', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        const depot = yield prisma.depot.findUnique({
            where: { id: depotId },
        });
        if (!depot) {
            return response.status(400).json({
                message: 'Depot não encontrado',
                error: true,
            });
        }
        const item = yield prisma.depotItem.create({
            data: {
                name,
                depotId,
                quantity,
                category,
                cost,
            },
        });
        loggingService_1.default.logInventoryCreate(userid, name, quantity, depot.name);
        return response.status(200).json({
            message: 'Item criado com sucesso',
            body: item,
            error: false,
        });
    }
    catch (err) {
        console.error(err);
        return response.status(500).json(err);
    }
}));
// Listagem de todos os itens de um depósito
router.get('/items', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { depotId } = request.query;
    if (!depotId || typeof depotId !== 'string') {
        return response.status(400).json({
            message: 'DepotId é obrigatório para buscar itens',
            error: true,
        });
    }
    try {
        const items = yield prisma.depotItem.findMany({
            where: {
                depotId,
            },
        });
        return response.status(200).json({
            message: 'Itens encontrados',
            body: items,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Atualização de um item
router.put('/items/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingItem = yield prisma.depotItem.findUnique({
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
        const updatedItem = yield prisma.depotItem.update({
            where: {
                id,
            },
            data: {
                name,
                quantity: quantityNew,
                category,
            },
        });
        loggingService_1.default.logInventoryUpdate(userid, existingItem.name, quantityOld, quantityOld - quantityNew);
        return response.status(200).json({
            message: 'Item atualizado com sucesso',
            body: updatedItem,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Diminuir a quantidade do item consumido
router.put('/items/quantity/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, quantityNew, ticketId } = request.body;
    const { userid } = request.headers;
    if (!userid || Array.isArray(userid)) {
        return response.status(400).json({
            message: 'User ID inválido',
            error: true,
        });
    }
    try {
        const existingDepositItem = yield prisma.depotItem.findUnique({
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
                message: 'A quantidade nova não pode ser maior que a quantidade atual',
                error: true,
            });
        }
        // Atualizar a quantidade do item
        const updatedItem = yield prisma.depotItem.update({
            where: {
                id: itemId,
            },
            data: {
                quantity: quantityOld - quantityNew,
            },
        });
        const cost = existingDepositItem.cost * quantityNew;
        // Adicionar registro na tabela TicketItem
        const newTicketItem = yield prisma.ticketItem.create({
            data: {
                ticketId,
                depotItemId: itemId,
                quantity: quantityNew,
                cost: cost,
            },
        });
        loggingService_1.default.logInventoryUpdate(userid, existingDepositItem.name, quantityOld, quantityOld - quantityNew);
        return response.status(200).json({
            message: 'Quantidade do item atualizada com sucesso',
            body: {
                updatedItem,
                newTicketItem,
            },
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Deleção de um item
router.delete('/items/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield prisma.depotItem.delete({
            where: {
                id,
            },
        });
        return response.status(200).json({
            message: 'Item deletado com sucesso',
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
