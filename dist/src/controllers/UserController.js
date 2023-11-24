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
const multer_1 = require("../middlewares/multer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get("/users", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = request.query.companyId;
    if (!companyId || typeof companyId !== "string") {
        return response.status(400).json({
            message: "Company ID is required and must be a string.",
            error: true,
        });
    }
    try {
        const getAllUsers = yield prisma.user.findMany({
            where: {
                UserCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return response.status(200).json(getAllUsers);
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/user", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.query;
    try {
        const getAllUsers = yield prisma.user.findUnique({
            where: {
                id: String(id),
            },
        });
        return response.status(200).json(getAllUsers);
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/technicians", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const companyId = request.query.companyId;
    if (!companyId || typeof companyId !== "string") {
        return response.status(400).json({
            message: "Company ID is required and must be a string.",
            error: true,
        });
    }
    try {
        const getAllTechnicians = yield prisma.user.findMany({
            where: {
                isTechnician: true,
                UserCompanies: {
                    some: {
                        companyId: companyId,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                isTechnician: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return response.status(200).json(getAllTechnicians);
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put("/user/update-avatar", multer_1.uploadAvatars.single("avatar"), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.query.userId;
    if (!request.file) {
        return response.status(400).json({
            message: "File upload is required.",
            error: true,
        });
    }
    const avatarUrl = `http://${request.headers.host}/uploads/avatars/${request.file.filename}`;
    if (!userId) {
        return response.status(400).json({
            message: "User ID is required.",
            error: true,
        });
    }
    try {
        const existingUser = yield prisma.user.findUnique({
            where: { id: userId },
            select: { avatarUrl: true },
        });
        if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.avatarUrl) {
            const oldAvatarFilename = path_1.default.basename(existingUser.avatarUrl);
            const oldAvatarPath = path_1.default.join(__dirname, "..", "..", "uploads", "avatars", oldAvatarFilename);
            if (fs_1.default.existsSync(oldAvatarPath)) {
                fs_1.default.unlinkSync(oldAvatarPath);
            }
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: avatarUrl },
        });
        return response.status(200).json({
            message: "Avatar updated successfully",
            updatedUser,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.patch("/update-user/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.params.id;
    const { username, name, email, phone, ramal, sector, isTechnician, companyIds, } = request.body;
    if (!email || !companyIds) {
        return response
            .status(400)
            .json("E-mail e Empresas são obrigatórios para atualização");
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { id: String(userId) },
        });
        if (!user) {
            return response.status(404).json("Usuário não encontrado");
        }
        const updateUser = yield prisma.user.update({
            where: { id: String(userId) },
            data: {
                username,
                name,
                email,
                phone,
                ramal,
                sector,
                isTechnician,
                UserCompanies: {
                    deleteMany: {},
                    create: companyIds.map((companyId) => ({
                        companyId,
                    })),
                },
            },
        });
        return response.status(200).json({
            message: "User updated successfully",
            body: updateUser,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put("/user/update-password", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newPassword } = request.body;
    if (!userId || !newPassword) {
        return response.status(400).json({
            message: "User ID and new password are required.",
            error: true,
        });
    }
    // Hash the new password before saving to the database.
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    try {
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return response.status(200).json({
            message: "Password updated successfully",
            updatedUser,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put("/user/update-signature", multer_1.uploadSignatures.single("signature"), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.query.userId;
    if (!request.file) {
        return response.status(400).json({
            message: "File upload is required.",
            error: true,
        });
    }
    const signatureUrl = `http://${request.headers.host}/uploads/signatures/${request.file.filename}`;
    if (!userId) {
        return response.status(400).json({
            message: "User ID is required.",
            error: true,
        });
    }
    try {
        // Pega o signatureUrl antigo
        const existingUser = yield prisma.user.findUnique({
            where: { id: userId },
            select: { signatureUrl: true },
        });
        // Se houver uma assinatura anterior, deleta o arquivo
        if (existingUser === null || existingUser === void 0 ? void 0 : existingUser.signatureUrl) {
            const oldSignatureFilename = path_1.default.basename(existingUser.signatureUrl);
            const oldSignaturePath = path_1.default.join(__dirname, "..", "..", "uploads", "signatures", oldSignatureFilename);
            // Se o arquivo existir no sistema de arquivos, deleta
            if (fs_1.default.existsSync(oldSignaturePath)) {
                fs_1.default.unlinkSync(oldSignaturePath);
            }
        }
        // Atualiza o signatureUrl no banco de dados
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { signatureUrl: signatureUrl },
        });
        return response.status(200).json({
            message: "Signature updated successfully",
            updatedUser,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/user/get-signature", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.query.userId;
    if (!userId) {
        return response.status(400).json({
            message: "User ID is required.",
            error: true,
        });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { id: String(userId) },
            select: { signatureUrl: true },
        });
        if (!user) {
            return response.status(404).json({
                message: "User not found.",
                error: true,
            });
        }
        return response.status(200).json({
            message: "Signature retrieved successfully.",
            body: user.signatureUrl,
        });
    }
    catch (error) {
        console.error(error);
        return response
            .status(500)
            .json({ message: "Internal server error", error: true });
    }
}));
exports.default = router;
