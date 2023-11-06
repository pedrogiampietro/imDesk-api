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
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = request.query;
    try {
        const groups = yield prisma.group.findMany({
            where: {
                GroupCompanies: {
                    some: {
                        companyId: String(companyId),
                    },
                },
            },
            include: {
                users: true,
            },
        });
        return response.status(201).json({
            message: "Group created successfully",
            body: groups,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, companyIds } = request.body;
    if (!name ||
        !companyIds ||
        !Array.isArray(companyIds) ||
        companyIds.length === 0) {
        return response.status(400).json({
            message: "Name e companyIds são obrigatórios para criar um grupo",
            error: true,
        });
    }
    try {
        const createGroup = yield prisma.group.create({
            data: {
                name: name,
                email: email,
                GroupCompanies: {
                    create: companyIds.map((companyId) => ({
                        companyId,
                    })),
                },
            },
        });
        return response.status(201).json({
            message: "Group created and associated successfully",
            body: createGroup,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json({
            message: "Error while creating group",
            error: err.message,
        });
    }
}));
router.delete("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield prisma.group.delete({
            where: {
                id: parseInt(id),
            },
        });
        return response.status(200).json({
            message: "Group deleted successfully",
            body: "",
            error: false,
        });
    }
    catch (error) {
        response.status(500).json({ error: "Erro ao excluir grupo" });
    }
}));
router.post("/add-user", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { userIds, groupId } = request.body;
    try {
        const updateUserPromises = userIds.map((userId) => prisma.user.update({
            where: { id: userId },
            data: { groupId: groupId },
        }));
        const updatedUsers = yield prisma.$transaction(updateUserPromises);
        return response.status(201).json({
            message: "Members added to group successfully",
            body: updatedUsers,
            error: false,
        });
    }
    catch (err) {
        console.error("Error adding users to group: ", err);
        // Retornar uma resposta de erro genérica
        return response.status(500).json({
            message: "An error occurred while adding members to the group.",
            error: true,
        });
    }
    finally {
        yield prisma.$disconnect();
    }
}));
router.patch("/:userId/remove-from-group", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = request.params;
    try {
        const updatedUser = yield prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                groupId: 0,
            },
        });
        return response.status(201).json({
            message: "Deleted member of group successfully",
            body: updatedUser,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
