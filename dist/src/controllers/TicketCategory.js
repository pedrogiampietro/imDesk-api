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
    const { name, childrenName, defaultText, companyIds } = request.body;
    if (!companyIds || companyIds.length === 0) {
        return response
            .status(400)
            .json({ message: "At least one Company ID is required.", error: true });
    }
    try {
        const createTicketCategory = yield prisma.ticketCategory.create({
            data: {
                name: name,
                childrenName: childrenName,
                defaultText: defaultText,
                TicketCategoryCompanies: {
                    create: companyIds.map((companyId) => ({
                        companyId: companyId,
                    })),
                },
            },
        });
        return response.status(200).json({
            message: "Ticket category created successfully",
            body: createTicketCategory,
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
        const getAllTicketCategory = yield prisma.ticketCategory.findMany({
            where: {
                TicketCategoryCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
            include: {
                TicketCategoryCompanies: {
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
        const addedResponse = (processedData, label) => processedData.filter((d) => d.label === label);
        const processBankResponse = (data) => {
            const processedData = [];
            for (let d of data) {
                const temp = addedResponse(processedData, d.name);
                if (!!temp.length) {
                    temp[0].options.push({
                        id: d.id,
                        label: d.name,
                        value: d.childrenName,
                        defaultText: d.defaultText,
                        company: d.TicketCategoryCompanies[0].company,
                    });
                }
                else {
                    processedData.push({
                        label: d.name,
                        options: [
                            {
                                id: d.id,
                                label: d.name,
                                value: d.childrenName,
                                defaultText: d.defaultText,
                                company: d.TicketCategoryCompanies[0].company,
                            },
                        ],
                    });
                }
            }
            return processedData;
        };
        return response.status(200).json({
            message: "Ticket category found",
            body: processBankResponse(getAllTicketCategory),
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/find-by-id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.query;
    try {
        const getCategory = yield prisma.ticketCategory.findUnique({
            where: {
                id: String(id),
            },
        });
        return response.status(200).json({
            message: "Category found",
            body: getCategory,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.patch("/update-category/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = request.params.id;
    const { name, childrenName, defaultText, companyIds } = request.body;
    if (!categoryId || !companyIds) {
        return response
            .status(400)
            .json("ID e Empresas são obrigatórios para atualização");
    }
    try {
        const priority = yield prisma.ticketCategory.findUnique({
            where: { id: String(categoryId) },
        });
        if (!priority) {
            return response.status(404).json("Usuário não encontrado");
        }
        const updateCategory = yield prisma.ticketCategory.update({
            where: { id: String(categoryId) },
            data: {
                name,
                childrenName,
                defaultText,
                TicketCategoryCompanies: {
                    deleteMany: {},
                    create: companyIds.map((companyId) => ({
                        companyId,
                    })),
                },
            },
        });
        return response.status(200).json({
            message: "Category updated successfully",
            body: updateCategory,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
