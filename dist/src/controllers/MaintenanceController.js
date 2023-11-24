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
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const addDays = (days, custom_date) => {
    const date = custom_date ? (0, dayjs_1.default)(custom_date) : (0, dayjs_1.default)();
    return date.add(days, 'days').toDate();
};
router.post('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location, model, patrimony, serialNumber, nextDatePreventive, companyId, } = request.body;
    if (!companyId || typeof companyId !== 'string') {
        return response.status(400).json({
            message: 'Company ID is required and must be a string.',
            error: true,
        });
    }
    const jsonListTodoo = [
        { id: (0, uuid_1.v4)(), name: 'Limpeza dos hardware', executed: false },
        { id: (0, uuid_1.v4)(), name: 'Analise dos software instalados', executed: false },
        { id: (0, uuid_1.v4)(), name: 'Atualização dos software', executed: false },
        { id: (0, uuid_1.v4)(), name: 'Limpeza de temporários em geral', executed: false },
    ];
    try {
        const getSingleMaintence = yield prisma.maintenance.findFirst({
            where: {
                name,
            },
        });
        if (getSingleMaintence) {
            return response.status(409).json({
                message: 'An equipment with that name already exists',
                body: null,
                error: true,
            });
        }
        const createMaintence = yield prisma.maintenance.create({
            data: {
                name,
                location,
                model,
                patrimony,
                serialNumber,
                nextDatePreventive,
                preventiveCount: 0,
                correctiveCount: 0,
                maintenanceListTodoo: jsonListTodoo,
                // companyId: companyId,
            },
        });
        return response.status(200).json({
            message: 'Maintenance created successfully',
            body: createMaintence,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = request.query;
    if (!companyId) {
        return response.status(400).json({
            message: 'CompanyId é obrigatório para buscar manutenções',
            error: true,
        });
    }
    try {
        const getAllMaintence = yield prisma.maintenance.findMany({
            where: {
            // companyId: Number(companyId),
            },
        });
        return response.status(200).json({
            message: 'Showing List Maintenance successfully',
            body: getAllMaintence,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.patch('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, description, maintenanceListTodoo, companyId } = request.body;
    if (!id || !companyId) {
        return response.status(400).json({
            message: 'Missing id or companyId, please try again!',
            body: null,
            error: true,
        });
    }
    const onlyExecuted = maintenanceListTodoo.filter((todoo) => todoo.executed);
    const getSingleMaintenance = yield prisma.maintenance.findFirst({
        where: {
            id,
            // companyId,
        },
    });
    if (!getSingleMaintenance) {
        return response.status(404).json({
            message: 'Maintenance not found with the provided id and companyId',
            body: null,
            error: true,
        });
    }
    const findAndUpdateMaintenance = yield prisma.maintenance.update({
        where: {
            id,
        },
        data: {
            preventiveCount: {
                increment: 1,
            },
            nextDatePreventive: addDays(90, getSingleMaintenance.nextDatePreventive),
            previousDatePreventive: addDays(0),
            description,
        },
    });
    yield prisma.historyMaintenance.create({
        data: {
            maintenanceId: id,
            maintenanceListTodoo: onlyExecuted,
        },
    });
    return response.status(201).json({
        message: 'Maintenance updated successfully',
        body: findAndUpdateMaintenance,
        error: false,
    });
}));
exports.default = router;
