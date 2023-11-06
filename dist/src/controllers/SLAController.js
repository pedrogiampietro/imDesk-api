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
    const { ticketPriority, resolutionTime } = request.body;
    try {
        const newSLA = yield prisma.sLADefinition.create({
            data: {
                ticketPriority,
                resolutionTime,
            },
        });
        return response.status(200).json({
            message: "SLA created successfully",
            body: newSLA,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slas = yield prisma.sLADefinition.findMany();
        return response.status(200).json({
            message: "SLAs retrieved successfully",
            body: slas,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const data = request.body;
    try {
        const updatedSLA = yield prisma.sLADefinition.update({
            where: { id: Number(id) },
            data,
        });
        return response.status(200).json({
            message: "SLA updated successfully",
            body: updatedSLA,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.delete("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield prisma.sLADefinition.delete({
            where: { id: Number(id) },
        });
        return response.status(204).send();
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
