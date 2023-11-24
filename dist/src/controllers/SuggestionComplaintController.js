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
    const { userId, company, description, category } = request.body;
    try {
        const newSuggestionComplaint = yield prisma.suggestionComplaint.create({
            data: {
                userId,
                companyId: company.id,
                description,
                category: category.value,
                status: "new",
            },
        });
        return response.status(201).json({
            message: "Suggestion created successfully",
            body: newSuggestionComplaint,
            error: false,
        });
    }
    catch (err) {
        console.log(err);
        return response.status(500).json(err);
    }
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = request.query;
    try {
        const suggestionsComplaints = yield prisma.suggestionComplaint.findMany({
            where: {
                companyId: String(companyId),
            },
        });
        return response.status(200).json({
            message: "Suggestion created successfully",
            body: suggestionsComplaints,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        const suggestionComplaint = yield prisma.suggestionComplaint.findUnique({
            where: { id },
        });
        if (suggestionComplaint) {
            return response.status(200).json({
                message: "Suggestion found successfully",
                body: suggestionComplaint,
                error: false,
            });
        }
        else {
            return response.status(404).json({
                message: "Suggestion not found",
                error: true,
            });
        }
    }
    catch (err) {
        console.error(err);
        return response.status(500).json({
            message: "Error retrieving suggestion",
            error: true,
        });
    }
}));
router.patch("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const { description, company, category, status, resolvedAt, feedback } = request.body;
    try {
        const updatedSuggestionComplaint = yield prisma.suggestionComplaint.update({
            where: { id },
            data: {
                description,
                category: category.value,
                status: status.value,
                companyId: company.id,
                resolvedAt: new Date(resolvedAt),
                feedback,
            },
        });
        return response.status(200).json({
            message: "Suggestion created successfully",
            body: updatedSuggestionComplaint,
            error: false,
        });
    }
    catch (err) {
        console.log(err);
        return response.status(500).json(err);
    }
}));
router.delete("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield prisma.suggestionComplaint.delete({
            where: { id },
        });
        return response.status(200).json({
            message: "Suggestion created successfully",
            body: null,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
