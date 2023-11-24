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
// Criar um novo provedor
router.post("/provider", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, address } = request.body;
    try {
        const provider = yield prisma.provider.create({
            data: {
                name: name,
                phone: phone,
                email: email,
                address: address,
            },
        });
        return response.status(200).json({
            message: "Provider created successfully",
            body: provider,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/provider", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllProviders = yield prisma.provider.findMany({
            include: {
                Contract: true,
                Service: true,
            },
        });
        return response.status(200).json({
            message: "Providers found",
            providers: getAllProviders,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Endpoint para atualizar um provider específico
router.put("/provider/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const providerId = request.params.id;
    const { name, phone, email, address, logoURL, description, category, price, status, } = request.body;
    try {
        const updatedProvider = yield prisma.provider.update({
            where: {
                id: providerId,
            },
            data: {
                name: name,
                phone: phone,
                email: email,
                address: address,
                logoURL: logoURL,
                description: description,
                category: category,
                price: price,
                status: status,
            },
        });
        return response.status(200).json({
            message: "Provider updated successfully",
            body: updatedProvider,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Deletar um provedor específico
router.delete("/provider/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const providerId = request.params.id;
    try {
        yield prisma.provider.delete({
            where: {
                id: providerId,
            },
        });
        return response.status(200).json({
            message: "Provider deleted successfully",
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Adicionar um novo serviço a um provedor específico
router.post("/service", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { providerId, name, price, companyId } = request.body;
    try {
        const service = yield prisma.service.create({
            data: {
                providerId: providerId,
                name: name,
                price: price,
                companyId: companyId,
            },
        });
        return response.status(200).json({
            message: "Service added successfully",
            body: service,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/service", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllService = yield prisma.service.findMany({
            include: {
                Company: true,
            },
        });
        return response.status(200).json({
            message: "Service found",
            body: getAllService,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
// Adicionar um novo contrato a um provedor específico
router.post("/contract", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { providerId, file, startDate, endDate, companyId } = request.body;
    try {
        const contract = yield prisma.contract.create({
            data: {
                providerId: providerId,
                file: file,
                startDate: startDate,
                endDate: endDate,
                companyId: companyId,
            },
        });
        return response.status(200).json({
            message: "Contract added successfully",
            body: contract,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/contract", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllContracts = yield prisma.contract.findMany({
            include: {
                Company: true,
            },
        });
        return response.status(200).json({
            message: "Contracts found",
            body: getAllContracts,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
