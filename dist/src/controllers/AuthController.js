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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const helperTenant_1 = require("../utils/helperTenant");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const saltRounds = 10;
router.post('/sign-up', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, email, password, phone, ramal, sector, isTechnician, companyIds, } = request.body;
    const tenantId = (0, helperTenant_1.getTenantId)(request);
    if (!email || !password || !companyIds)
        response
            .status(400)
            .json('Nome, e-mail, senha e companyIds são obrigatórios para cadastro');
    const hashedPassword = bcrypt_1.default.hashSync(password, saltRounds);
    try {
        const createUser = yield prisma.user.create({
            data: {
                username,
                name,
                email,
                password: hashedPassword,
                phone,
                ramal,
                sector,
                isTechnician,
                groupId: null,
                UserCompanies: {
                    create: companyIds.map((companyId) => ({
                        companyId,
                    })),
                },
                tenantId: String(tenantId),
            },
        });
        return response.status(201).json({
            message: 'User created successfully',
            body: createUser,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post('/sign-in', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, companyId, companyName } = request.body;
    const tenantId = (0, helperTenant_1.getTenantId)(request);
    if (!email || !password || !companyId)
        response
            .status(400)
            .json('Nome, e-mail, senha e companyIds são obrigatórios para cadastro');
    try {
        const findUser = yield prisma.user.findFirst({
            where: {
                email: email,
                tenantId: String(tenantId),
            },
            include: {
                UserCompanies: {
                    select: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!findUser) {
            return response.status(404).json('Usuário não encontrado no sistema.');
        }
        if (findUser.UserCompanies.length === 0) {
            return response
                .status(400)
                .json('Usuário não associado a nenhuma empresa.');
        }
        const isAssociatedWithCompany = findUser.UserCompanies.some((uc) => uc.company.id === companyId);
        if (!isAssociatedWithCompany) {
            return response
                .status(400)
                .json('Usuário não está associado à empresa informada.');
        }
        const validPassword = yield bcrypt_1.default.compare(password, findUser.password);
        if (!validPassword) {
            return response.status(400).json('Password incorreto, tente novamente.');
        }
        yield prisma.user.update({
            where: {
                id: findUser.id,
            },
            data: {
                currentLoggedCompanyId: companyId,
                currentLoggedCompanyName: companyName,
            },
        });
        const token = (0, jwt_1.generateAccessToken)(findUser.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(findUser.id, token);
        return response.status(200).json({
            id: findUser.id,
            name: findUser.name,
            email: findUser.email,
            avatarUrl: findUser.avatarUrl,
            isTechnician: findUser.isTechnician,
            companies: findUser.UserCompanies.map((uc) => ({
                companyId: uc.company.id,
                companyName: uc.company.name,
            })),
            currentLogged: {
                currentLoggedCompanyId: companyId,
                currentLoggedCompanyName: companyName,
            },
            tokens: {
                token: token,
                refreshToken: refreshToken,
            },
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
