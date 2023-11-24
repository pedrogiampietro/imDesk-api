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
router.get('/get-tenant', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let subdomain = request.hostname.split('.')[0];
    if (request.hostname === 'localhost') {
        const getTenant = yield prisma.tenant.findUnique({
            where: {
                subdomain: 'imdesktest',
            },
        });
        request.tenantId = getTenant === null || getTenant === void 0 ? void 0 : getTenant.id;
        subdomain = 'imdesktest';
    }
    try {
        const getTenant = yield prisma.tenant.findUnique({
            where: {
                subdomain,
            },
        });
        if (!getTenant) {
            return response.status(400).json({
                message: 'Tenant not exists',
                body: null,
                error: true,
            });
        }
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post('/create-tenant', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, subdomain } = request.body;
    if (!name || !subdomain)
        return response.status(400).json('Nome e dominio são obrigatórios');
    //todo refafactor validation to use yup
    const findTenant = yield prisma.tenant.findMany({
        where: {
            subdomain,
        },
    });
    if (findTenant.length > 0) {
        return response.status(409).json('Já existe um dominio com esse nome.');
    }
    try {
        const createUser = yield prisma.tenant.create({
            data: {
                name,
                subdomain,
            },
        });
        return response.status(201).json({
            message: 'Project created successfully',
            body: createUser,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
