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
    const { name, companyIds } = request.body;
    if (!name ||
        !companyIds ||
        !Array.isArray(companyIds) ||
        companyIds.length === 0) {
        return response.status(400).json({
            message: "Name e companyIds são obrigatórios para criar uma localização",
            error: true,
        });
    }
    try {
        const createLocation = yield prisma.locations.create({
            data: {
                name: name,
                LocationCompanies: {
                    create: companyIds.map((companyId) => ({
                        companyId,
                    })),
                },
            },
        });
        return response.status(201).json({
            message: "Location created successfully",
            body: createLocation,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = request.query;
    if (!companyId || typeof companyId !== "string") {
        return response.status(400).json({
            message: "Company ID is required and must be a string.",
            error: true,
        });
    }
    try {
        const getAllLocation = yield prisma.locations.findMany({
            where: {
                LocationCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
            include: {
                LocationCompanies: true,
            },
        });
        return response.status(200).json({
            message: "Locations found",
            body: getAllLocation,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
