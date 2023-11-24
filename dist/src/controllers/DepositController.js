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
// Criação de um novo depósito
router.post('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, companyId, location } = request.body;
    if (!name || !companyId) {
        return response.status(400).json({
            message: 'Name, companyId e userId são obrigatórios para criar um depósito',
            error: true,
        });
    }
    try {
        // Obter o nome da empresa (hospital) com base no companyId
        const company = yield prisma.company.findUnique({
            where: {
                id: companyId,
            },
            select: {
                name: true,
            },
        });
        if (!company) {
            return response.status(404).json({
                message: 'Empresa não encontrada',
                error: true,
            });
        }
        const findLocation = yield prisma.locations.findUnique({
            where: {
                id: location,
            },
        });
        if (!findLocation) {
            return response.status(404).json({
                message: 'Localização não encontrada',
                error: true,
            });
        }
        console.log('findLocation', findLocation);
        const depot = yield prisma.depot.create({
            data: {
                name,
                companyId,
                location,
            },
        });
        const responseBody = Object.assign(Object.assign({}, depot), { Company: {
                name: company.name,
            }, locationName: findLocation.name });
        return response.status(200).json({
            message: 'Depósito criado com sucesso',
            body: responseBody,
            error: false,
        });
    }
    catch (err) {
        console.error(err);
        return response.status(500).json(err);
    }
}));
// Listagem de todos os depósitos de uma empresa
router.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = request.query;
    if (!companyId || typeof companyId !== 'string') {
        return response.status(400).json({
            message: 'CompanyId é obrigatório para buscar depósitos',
            error: true,
        });
    }
    try {
        const depots = yield prisma.depot.findMany({
            where: {
                companyId,
            },
            include: {
                Company: true,
                DepotUsers: {
                    include: {
                        User: true,
                    },
                },
            },
        });
        const locationNames = yield Promise.all(depots.map((depot) => __awaiter(void 0, void 0, void 0, function* () {
            const location = yield prisma.locations.findUnique({
                where: {
                    id: depot.location,
                },
            });
            return location ? location.name : null;
        })));
        const depotsWithUsers = depots.map((depot, index) => (Object.assign(Object.assign({}, depot), { users: depot.DepotUsers.map((depotUser) => depotUser.User), locationName: locationNames[index] })));
        return response.status(200).json({
            message: 'Depósitos encontrados',
            body: depotsWithUsers,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Atualização de um depósito
router.put('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const { name, userId } = request.body;
    try {
        const depot = yield prisma.depot.update({
            where: {
                id,
            },
            data: {
                name,
            },
            include: {
                Company: true,
                DepotUsers: {
                    include: {
                        User: true,
                    },
                },
            },
        });
        const existingDepotUsers = yield prisma.depotUser.findMany({
            where: {
                depotId: id,
            },
        });
        const usersToRemove = existingDepotUsers.filter((depotUser) => !userId.includes(depotUser.userId));
        for (let user of usersToRemove) {
            yield prisma.depotUser.delete({
                where: {
                    depotId_userId: {
                        depotId: id,
                        userId: user.userId,
                    },
                },
            });
        }
        for (let usersId of userId) {
            const existingDepotUser = existingDepotUsers.find((depotUser) => depotUser.userId === usersId);
            if (!existingDepotUser) {
                yield prisma.depotUser.create({
                    data: {
                        depotId: id,
                        userId: usersId,
                    },
                });
            }
        }
        // Busque o Depot atualizado do banco de dados
        const updatedDepot = yield prisma.depot.findUnique({
            where: {
                id,
            },
            include: {
                Company: true,
                DepotUsers: {
                    include: {
                        User: true,
                    },
                },
            },
        });
        return response.status(200).json({
            message: 'Depósito atualizado com sucesso',
            body: updatedDepot,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Deleção de um depósito
router.delete('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield prisma.depot.delete({
            where: {
                id,
            },
        });
        return response.status(200).json({
            message: 'Depósito deletado com sucesso',
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
