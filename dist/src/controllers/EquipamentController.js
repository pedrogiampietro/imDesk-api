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
    const { name, model, serialNumber, patrimonyTag, type, companyId, groupId, locationId, } = request.body;
    try {
        const newEquipment = yield prisma.equipments.create({
            data: {
                name,
                model,
                serialNumber,
                patrimonyTag,
                type,
                locationId,
            },
        });
        if (newEquipment) {
            yield prisma.equipmentCompany.create({
                data: {
                    equipmentId: newEquipment.id,
                    companyId: companyId,
                    groupId: groupId,
                },
            });
        }
        return response.status(201).json({
            message: "Equipamento criado com sucesso!",
            body: newEquipment,
            error: false,
        });
    }
    catch (err) {
        console.error(err);
        return response
            .status(500)
            .json({ message: "Ocorreu um erro ao criar o equipamento." });
    }
}));
router.put("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const id = request.path;
    const { name, model, serialNumber, patrimonyTag, type, companyId, groupId } = request.body;
    try {
        const equipment = yield prisma.equipments.findUnique({
            where: {
                id: id,
            },
        });
        if (!equipment) {
            return response
                .status(404)
                .json({ message: "Equipamento não encontrado." });
        }
        const updatedEquipment = yield prisma.equipments.update({
            where: {
                id: id,
            },
            data: {
                name,
                model,
                serialNumber,
                patrimonyTag,
                type,
            },
        });
        if (companyId || groupId) {
            yield prisma.equipmentCompany.updateMany({
                where: {
                    equipmentId: id,
                },
                data: Object.assign(Object.assign({}, (companyId ? { companyId: companyId } : {})), (groupId ? { groupId: groupId } : {})),
            });
        }
        return response.status(200).json({
            message: "Equipamento atualizado com sucesso!",
            body: updatedEquipment,
        });
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            message: "Ocorreu um erro ao atualizar o equipamento.",
            error: err.message,
        });
    }
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = request.query;
    if (!companyId || typeof companyId !== "string") {
        return response.status(400).json({
            message: "CompanyId é obrigatório para buscar prioridades de equipaments",
            error: true,
        });
    }
    try {
        const getAllEquipaments = yield prisma.equipments.findMany({
            include: {
                EquipmentCompanies: true,
            },
            where: {
                EquipmentCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
        });
        return response.status(200).json({
            message: "Equipamento encontrado",
            body: getAllEquipaments,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
