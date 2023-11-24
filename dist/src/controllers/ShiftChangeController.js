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
    const { controleTemperatura, companyId, responsibleUserId, atribuidos, planejados, pendentes, } = request.body;
    try {
        const shiftChange = yield prisma.shiftChange.create({
            data: {
                date: new Date(),
                responsibleUserId,
                temperatureControl: controleTemperatura,
                ShiftChangeCompanies: {
                    create: { companyId },
                },
            },
        });
        const extractValidTicketIds = (tickets) => {
            return tickets
                .filter((ticket) => ticket.id && ticket.id.trim() !== "")
                .map((ticket) => ticket.id);
        };
        const allTicketIds = [
            ...extractValidTicketIds(atribuidos),
            ...extractValidTicketIds(planejados),
            ...extractValidTicketIds(pendentes),
        ];
        for (const ticket of atribuidos) {
            if (ticket.id && ticket.id.trim() !== "") {
                yield prisma.shiftChangeAssignedTicket.create({
                    data: {
                        shiftChangeId: shiftChange.id,
                        ticketId: ticket.id,
                    },
                });
            }
        }
        for (const ticket of planejados) {
            if (ticket.id && ticket.id.trim() !== "") {
                yield prisma.shiftChangePlannedTicket.create({
                    data: {
                        shiftChangeId: shiftChange.id,
                        ticketId: ticket.id,
                    },
                });
            }
        }
        for (const ticket of pendentes) {
            if (ticket.id && ticket.id.trim() !== "") {
                yield prisma.shiftChangePendingTicket.create({
                    data: {
                        shiftChangeId: shiftChange.id,
                        ticketId: ticket.id,
                    },
                });
            }
        }
        return response.status(200).json({
            message: "Shift Change created successfully",
            shiftChange: shiftChange,
        });
    }
    catch (err) {
        console.error("Error on creating Shift Change: ", err);
        return response
            .status(500)
            .json({ message: "Internal server error", error: true });
    }
}));
router.get("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shiftChanges = yield prisma.shiftChange.findMany({
            include: {
                ShiftChangeCompanies: true,
                ResponsibleUser: true,
                ShiftChangeAssignedTicket: {
                    include: {
                        Ticket: {
                            select: {
                                id: true,
                                description: true,
                            },
                        },
                    },
                },
                ShiftChangePendingTicket: {
                    include: {
                        Ticket: {
                            select: {
                                id: true,
                                description: true,
                            },
                        },
                    },
                },
                ShiftChangePlannedTicket: {
                    include: {
                        Ticket: {
                            select: {
                                id: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });
        return response.status(200).json({
            message: "Shift Changes found",
            body: shiftChanges,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const id = request.params.id;
    try {
        const shiftChange = yield prisma.shiftChange.findUnique({
            where: { id },
            include: {
                ShiftChangeCompanies: true,
                ResponsibleUser: true,
                ShiftChangeAssignedTicket: true,
                ShiftChangePendingTicket: true,
                ShiftChangePlannedTicket: true,
            },
        });
        return response.status(200).json({
            message: "Shift Changes found",
            body: shiftChange,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const id = request.params.id;
    const { date, responsibleUserId, temperatureControl } = request.body;
    try {
        const shiftChange = yield prisma.shiftChange.update({
            where: { id },
            data: {
                date,
                responsibleUserId,
                temperatureControl,
            },
        });
        return response.status(200).json({
            message: "Shift Change updated successfully",
            body: shiftChange,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.delete("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const id = request.params.id;
    try {
        yield prisma.shiftChange.delete({ where: { id } });
        return response.status(200).json({
            message: "Shift Changes deleted successfully",
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
exports.default = router;
