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
const json2csv_1 = require("json2csv");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get("/dashboard", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = request.body;
        const openStatuses = ["new", "assigned"];
        const statusCounts = yield prisma.ticket.groupBy({
            where: {
                userId,
                status: { in: openStatuses },
            },
            by: ["status"],
            _count: true,
        });
        const lateTicketsCount = yield prisma.ticket.count({
            where: {
                userId,
                timeEstimate: {
                    lt: new Date(),
                },
                status: { in: openStatuses },
            },
        });
        const newTicketsCount = ((_a = statusCounts.find((item) => item.status === "new")) === null || _a === void 0 ? void 0 : _a._count) || 0;
        const assignedTicketsCount = ((_b = statusCounts.find((item) => item.status === "assigned")) === null || _b === void 0 ? void 0 : _b._count) || 0;
        const categoryCounts = yield prisma.ticket.groupBy({
            where: {
                userId,
                status: { in: openStatuses },
            },
            by: ["ticketCategoryId"],
            _count: true,
        });
        const priorityCounts = yield prisma.ticket.groupBy({
            where: {
                userId,
                status: { in: openStatuses },
            },
            by: ["ticketPriorityId"],
            _count: true,
        });
        const recentTickets = yield prisma.ticket.findMany({
            where: {
                userId,
                status: { in: openStatuses },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        const allTickets = yield prisma.ticket.count({
            where: {
                userId,
                status: { in: openStatuses },
            },
        });
        const ticketsToday = yield prisma.ticket.count({
            where: {
                userId,
                timeEstimate: {
                    equals: new Date(),
                },
                status: { in: openStatuses },
            },
        });
        const ticketsTomorrow = yield prisma.ticket.count({
            where: {
                userId,
                timeEstimate: {
                    equals: new Date(new Date().setDate(new Date().getDate() + 1)),
                },
                status: { in: openStatuses },
            },
        });
        const ticketsAfter = yield prisma.ticket.count({
            where: {
                userId,
                timeEstimate: {
                    gte: new Date(new Date().setDate(new Date().getDate() + 2)),
                },
                status: { in: openStatuses },
            },
        });
        return response.status(200).json({
            message: "Dashboard data retrieved successfully",
            error: false,
            newTicketsCount,
            lateTicketsCount,
            assignedTicketsCount,
            statusCounts,
            categoryCounts,
            priorityCounts,
            recentTickets,
            dueDateService: {
                all: allTickets,
                today: ticketsToday,
                tomorrow: ticketsTomorrow,
                after: ticketsAfter,
            },
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post("/os", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, startDate, endDate } = request.body;
        const getUser = yield prisma.user.findUnique({
            where: { id: userId },
        });
        const adjustedStartDate = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));
        const adjustedEndDate = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
        const openedOSCount = yield prisma.ticket.count({
            where: {
                assignedTo: {
                    equals: `${userId}-${getUser === null || getUser === void 0 ? void 0 : getUser.name}`,
                },
                createdAt: {
                    gte: adjustedStartDate,
                    lte: adjustedEndDate,
                },
            },
        });
        const closedOSCount = yield prisma.ticket.count({
            where: {
                assignedTo: {
                    equals: `${userId}-${getUser === null || getUser === void 0 ? void 0 : getUser.name}`,
                },
                closedAt: {
                    gte: adjustedStartDate,
                    lte: adjustedEndDate,
                },
            },
        });
        const tickets = yield prisma.ticket.findMany({
            where: {
                assignedTo: {
                    equals: `${userId}-${getUser === null || getUser === void 0 ? void 0 : getUser.name}`,
                },
                AND: [
                    {
                        createdAt: {
                            gte: adjustedStartDate,
                        },
                    },
                    {
                        createdAt: {
                            lte: adjustedEndDate,
                        },
                    },
                ],
            },
            select: {
                id: true,
                ticketCategory: true,
                description: true,
                status: true,
                createdAt: true,
                closedAt: true,
                observationServiceExecuted: true,
            },
        });
        return response.status(200).json({
            openedOS: openedOSCount,
            closedOS: closedOSCount,
            tickets,
            error: false,
        });
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        return response.status(500).json({ error: true, message: err.message });
    }
}));
router.get("/os/export", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, format } = request.query;
        const startDateParam = request.query.startDate;
        const endDateParam = request.query.endDate;
        const isStartDateString = typeof startDateParam === "string";
        const isEndDateString = typeof endDateParam === "string";
        const getUser = yield prisma.user.findUnique({
            where: { id: String(userId) },
        });
        const adjustedStartDate = isStartDateString
            ? new Date(new Date(startDateParam).setUTCHours(0, 0, 0, 0))
            : new Date();
        const adjustedEndDate = isEndDateString
            ? new Date(new Date(endDateParam).setUTCHours(23, 59, 59, 999))
            : new Date();
        const fields = [
            {
                label: "ID",
                value: "id",
            },
            {
                label: "Categoria",
                value: (row) => { var _a, _b; return `${(_a = row.ticketCategory) === null || _a === void 0 ? void 0 : _a.name} - ${(_b = row.ticketCategory) === null || _b === void 0 ? void 0 : _b.childrenName}`; },
            },
            {
                label: "Descrição",
                value: "description",
            },
            {
                label: "Status",
                value: "status",
            },
            {
                label: "Data de Criação",
                value: (row) => formatDate(row.createdAt),
            },
            {
                label: "Data de Fechamento",
                value: (row) => (row.closedAt ? formatDate(row.closedAt) : "N/A"),
            },
        ];
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return (date.toLocaleDateString("pt-BR") +
                " " +
                date.toLocaleTimeString("pt-BR"));
        }
        const openedOSCount = yield prisma.ticket.count({
            where: {
                assignedTo: {
                    equals: `${userId}-${getUser === null || getUser === void 0 ? void 0 : getUser.name}`,
                },
                createdAt: {
                    gte: adjustedStartDate,
                    lte: adjustedEndDate,
                },
            },
        });
        const closedOSCount = yield prisma.ticket.count({
            where: {
                assignedTo: {
                    equals: `${userId}-${getUser === null || getUser === void 0 ? void 0 : getUser.name}`,
                },
                closedAt: {
                    gte: adjustedStartDate,
                    lte: adjustedEndDate,
                },
            },
        });
        const tickets = yield prisma.ticket.findMany({
            where: {
                assignedTo: {
                    equals: `${userId}-${getUser === null || getUser === void 0 ? void 0 : getUser.name}`,
                },
                AND: [
                    {
                        createdAt: {
                            gte: adjustedStartDate,
                        },
                    },
                    {
                        createdAt: {
                            lte: adjustedEndDate,
                        },
                    },
                ],
            },
            select: {
                id: true,
                ticketCategory: true,
                description: true,
                status: true,
                createdAt: true,
                closedAt: true,
                observationServiceExecuted: true,
            },
        });
        if (format === "csv") {
            const json2csvParser = new json2csv_1.Parser({ fields });
            const csv = json2csvParser.parse(tickets);
            response.setHeader("Content-disposition", "attachment; filename=report.csv");
            response.set("Content-Type", "text/csv");
            response.status(200).send(csv);
        }
        else {
            response.status(400).send("Formato de exportação não suportado");
        }
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        response.status(500).json({ error: true, message: err.message });
    }
}));
router.get("/open-tickets-by-location", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtém todos os tickets que estão abertos, agrupados por localização
        const openTicketsCountByLocation = yield prisma.ticket.groupBy({
            by: ["ticketLocationId"],
            _count: {
                id: true,
            },
            where: {
                status: {
                    in: ["new", "assigned", "closed"],
                },
            },
        });
        const openTicketsWithLocationNames = yield Promise.all(openTicketsCountByLocation.map((location) => __awaiter(void 0, void 0, void 0, function* () {
            const locationInfo = yield prisma.locations.findUnique({
                where: { id: location.ticketLocationId },
                select: { name: true },
            });
            return {
                locationName: locationInfo === null || locationInfo === void 0 ? void 0 : locationInfo.name,
                openTicketsCount: location._count.id,
            };
        })));
        return response.status(200).json({
            body: openTicketsWithLocationNames,
            message: "",
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json({ error: true, message: err.message });
    }
}));
router.get("/sla-violations-by-technician", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Buscar todos os tickets que estão fechados
        const closedTickets = yield prisma.ticket.findMany({
            where: {
                closedAt: {
                    not: null,
                },
                OR: [
                    { timeEstimate: { not: null } }, // Tickets com estimativa de tempo definida
                ],
            },
            select: {
                id: true,
                closedBy: true,
                closedAt: true,
                timeEstimate: true,
            },
        });
        // Filtrar os tickets que violaram o SLA com base nas condições especificadas
        const slaViolationsByTechnician = closedTickets.reduce((acc, ticket) => {
            const technicianId = ticket.closedBy;
            if (technicianId) {
                if (!acc[technicianId]) {
                    acc[technicianId] = { slaViolationsCount: 0 };
                }
                // Checar se o SLA foi violado ou se o ticket foi fechado após o tempo estimado
                if (ticket.timeEstimate &&
                    ticket.closedAt &&
                    new Date(ticket.closedAt) > new Date(ticket.timeEstimate)) {
                    acc[technicianId].slaViolationsCount++;
                }
            }
            return acc;
        }, {});
        return response.status(200).json({
            body: slaViolationsByTechnician,
            message: "SLA violations by technician retrieved successfully.",
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json({ error: true, message: err.message });
    }
}));
exports.default = router;
