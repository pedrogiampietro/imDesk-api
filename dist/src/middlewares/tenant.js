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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const tenantMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let subdomain = req.hostname.split('.')[0];
    if (req.hostname === 'localhost') {
        const getTenant = yield prisma.tenant.findUnique({
            where: {
                subdomain: 'imdesktest',
            },
        });
        req.tenantId = getTenant === null || getTenant === void 0 ? void 0 : getTenant.id;
        subdomain = 'imdesktest';
    }
    try {
        const tenantId = yield getTenantIdFromSubdomain(subdomain);
        if (tenantId) {
            req.tenantId = tenantId;
            next();
        }
        else {
            console.log('Tenant não encontrado');
            res.status(404).send('Tenant não encontrado');
        }
    }
    catch (error) {
        console.error('Erro ao buscar tenant:', error);
        res.status(500).send('Erro interno do servidor');
    }
});
exports.tenantMiddleware = tenantMiddleware;
function getTenantIdFromSubdomain(subdomain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tenant = yield prisma.tenant.findUnique({
                where: {
                    subdomain: subdomain,
                },
            });
            return tenant ? tenant.id : null;
        }
        catch (error) {
            console.error('Erro ao buscar tenant:', error);
            throw new Error('Erro ao buscar tenant');
        }
    });
}
