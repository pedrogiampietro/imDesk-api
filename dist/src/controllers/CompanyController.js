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
// Create a company
router.post('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address } = request.body;
    if (!name || !address) {
        return response
            .status(400)
            .json('O nome e o endereço são obrigatórios para criar uma empresa');
    }
    try {
        const newCompany = yield prisma.company.create({
            data: {
                name,
                address,
            },
        });
        return response.status(201).json({
            message: 'Empresa criada com sucesso',
            newCompany,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Get all companies
router.get('/', (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield prisma.company.findMany();
        return response.status(200).json({
            message: 'Empresas recuperadas com sucesso',
            companies,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Get a company by ID
router.get('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        const company = yield prisma.company.findUnique({
            where: {
                id: id,
            },
        });
        if (!company) {
            return response.status(404).json('Empresa não encontrada');
        }
        return response.status(200).json({
            message: 'Empresa recuperada com sucesso',
            body: company,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Update a company by ID
router.put('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const { name, address } = request.body;
    try {
        const updatedCompany = yield prisma.company.update({
            where: {
                id: id,
            },
            data: {
                name,
                address,
            },
        });
        return response.status(200).json({
            message: 'Empresa atualizada com sucesso',
            body: updatedCompany,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
