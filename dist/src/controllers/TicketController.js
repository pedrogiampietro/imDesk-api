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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const multer_1 = require("../middlewares/multer");
const webhookService_1 = require("../services/webhookService");
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.post('/', multer_1.uploadTickets.array('ticket_images'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { userId } = request.query;
        const companyIds = JSON.parse(request.body.companyIds);
        const equipmentTicketLocationId = JSON.parse(request.body.equipmentTicketLocationId);
        const values = JSON.parse(request.body.values);
        const ticket_images = request.files;
        const { ticket_description, ticket_type, ticket_category, ticket_priority, ticket_location, manualResolutionDueDate, } = values;
        if (!companyIds || companyIds.length === 0) {
            return response.status(400).json({
                message: 'Company IDs are required and must be an array.',
                error: true,
            });
        }
        const userCompanies = yield prisma.userCompany.findMany({
            where: {
                userId: userId,
                companyId: {
                    in: companyIds,
                },
            },
        });
        if (userCompanies.length === 0) {
            return response.status(404).json({
                message: 'User is not associated with the provided companies',
                error: true,
            });
        }
        const currentUserGroup = yield prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                groupId: true,
            },
        });
        const ticketPriorityObj = yield prisma.ticketPriority.findUnique({
            where: {
                id: ticket_priority,
            },
        });
        if (!ticketPriorityObj) {
            return response.status(400).json({
                message: 'Invalid ticket type, category, or priority ID provided.',
                error: true,
            });
        }
        const slaDef = yield prisma.sLADefinition.findFirst({
            where: {
                ticketPriority: ticketPriorityObj.name,
            },
        });
        if (!slaDef) {
            return response.status(400).json({
                message: 'No SLA definition found for the provided ticket priority.',
                error: true,
            });
        }
        let resolutionDueDate = new Date();
        if (manualResolutionDueDate) {
            resolutionDueDate = new Date(manualResolutionDueDate); // Se manualResolutionDueDate for fornecido, use-o
        }
        else {
            resolutionDueDate.setHours(resolutionDueDate.getHours() + slaDef.resolutionTime); // Caso contrário, use o SLA padrão
        }
        const ticketImages = ticket_images.map((image) => ({
            path: `http://${request.headers.host}/uploads/tickets_img/${image.filename}`,
        }));
        const ticketCompanies = companyIds.map((companyId) => ({
            companyId: companyId,
        }));
        const uuidValidationRegex = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$');
        const isValidEquipmentId = equipmentTicketLocationId &&
            uuidValidationRegex.test(equipmentTicketLocationId);
        const ticketData = Object.assign({ description: ticket_description, ticketTypeId: ticket_type, ticketCategoryId: ticket_category, ticketLocationId: ticket_location, ticketPriorityId: ticket_priority, status: 'new', assignedTo: [], images: {
                create: ticketImages,
            }, groupId: currentUserGroup === null || currentUserGroup === void 0 ? void 0 : currentUserGroup.groupId, timeEstimate: resolutionDueDate, manualResolutionDueDate: manualResolutionDueDate
                ? new Date(manualResolutionDueDate)
                : null, userId, TicketCompanies: {
                create: ticketCompanies,
            } }, (isValidEquipmentId && {
            Equipments: {
                create: [
                    {
                        equipmentId: equipmentTicketLocationId,
                    },
                ],
            },
        }));
        const createTicket = yield prisma.ticket.create({
            data: ticketData,
            include: {
                ticketCategory: true,
                ticketLocation: true,
                ticketPriority: true,
                ticketType: true,
                images: true,
                User: {
                    include: {
                        UserCompanies: true,
                    },
                },
                Equipments: {
                    include: {
                        equipment: true,
                    },
                },
            },
        });
        const ticketCategoryId = {
            id: createTicket.ticketCategory.id,
            name: createTicket.ticketCategory.name,
            childrenName: createTicket.ticketCategory.childrenName,
            defaultText: createTicket.ticketCategory.defaultText,
        };
        const ticketLocationId = {
            id: createTicket.ticketLocation.id,
            name: createTicket.ticketLocation.name,
        };
        const ticketPriorityId = {
            id: createTicket.ticketPriority.id,
            name: createTicket.ticketPriority.name,
        };
        const ticketTypeId = {
            id: createTicket.ticketType.id,
            name: createTicket.ticketType.name,
        };
        const User = {
            id: (_a = createTicket.User) === null || _a === void 0 ? void 0 : _a.id,
            username: (_b = createTicket.User) === null || _b === void 0 ? void 0 : _b.username,
            name: (_c = createTicket.User) === null || _c === void 0 ? void 0 : _c.name,
            email: (_d = createTicket.User) === null || _d === void 0 ? void 0 : _d.email,
            password: (_e = createTicket.User) === null || _e === void 0 ? void 0 : _e.password,
            phone: (_f = createTicket.User) === null || _f === void 0 ? void 0 : _f.phone,
            ramal: (_g = createTicket.User) === null || _g === void 0 ? void 0 : _g.ramal,
            sector: (_h = createTicket.User) === null || _h === void 0 ? void 0 : _h.sector,
            createdAt: (_j = createTicket.User) === null || _j === void 0 ? void 0 : _j.createdAt,
            updatedAt: (_k = createTicket.User) === null || _k === void 0 ? void 0 : _k.updatedAt,
            Company: (_l = createTicket.User) === null || _l === void 0 ? void 0 : _l.UserCompanies,
        };
        const equipmentUsageCounts = yield prisma.ticketEquipments.groupBy({
            by: ['equipmentId'],
            _count: {
                equipmentId: true,
            },
            where: {
                equipmentId: {
                    in: createTicket.Equipments.map((equipment) => equipment.equipmentId),
                },
            },
        });
        const usageCountMap = equipmentUsageCounts.reduce((map, item) => {
            map[item.equipmentId] = item._count.equipmentId;
            return map;
        }, {});
        const equipmentUsageData = createTicket.Equipments.map((equipment) => {
            const equipmentDetails = equipment.equipment || {};
            return {
                equipmentId: equipment.equipmentId,
                equipmentSerial: equipmentDetails.serialNumber,
                equipmentPatrimony: equipmentDetails.patrimonyTag,
                equipmentName: equipmentDetails.name,
                usageCount: usageCountMap[equipment.equipmentId] || 0,
            };
        });
        const responseObj = {
            id: createTicket.id,
            description: createTicket.description,
            ticketType: createTicket.ticketType,
            ticketCategory: createTicket.ticketCategory,
            ticketPriority: createTicket.ticketPriority,
            ticketLocation: createTicket.ticketLocation,
            assignedTo: createTicket.assignedTo,
            images: createTicket.images,
            assignedToAt: createTicket.assignedToAt,
            closedBy: createTicket.closedBy,
            closedAt: createTicket.closedAt,
            status: createTicket.status,
            timeEstimate: resolutionDueDate,
            isDelay: createTicket.isDelay,
            userId: createTicket.userId,
            createdAt: createTicket.createdAt,
            updatedAt: createTicket.updatedAt,
            ticketCategoryId,
            ticketLocationId,
            ticketPriorityId,
            ticketTypeId,
            User,
            equipmentUsage: equipmentUsageData,
        };
        const data = {
            userId: userId,
            ticketId: createTicket.id,
            type: 'new_ticket',
        };
        yield (0, webhookService_1.createTicketNotificationDiscord)(responseObj);
        yield (0, notificationService_1.createNotification)(data);
        const groupName = process.env.GROUP_NAME || 'NOT FOUND';
        const group = yield prisma.group.findFirst({
            where: {
                name: groupName,
            },
        });
        if (group) {
            const newId = createTicket.id.split('-');
            yield prisma.emailQueue.create({
                data: {
                    to: group.email,
                    subject: 'Novo Chamado Aberto',
                    text: `Um novo chamado foi criado: #${newId[0]}, ${createTicket.description}`,
                },
            });
        }
        else {
            console.error(`Grupo ${groupName} não encontrado`);
        }
        return response.status(200).json({
            message: 'Ticket created successfully',
            body: responseObj,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get('/', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    try {
        const { companyId, currentUserId, ticketPriorityId } = request.query;
        if (!companyId || typeof companyId !== 'string') {
            return response.status(400).json({
                message: 'Company ID is required and must be a string.',
                error: true,
            });
        }
        const userIdStr = String(currentUserId);
        const currentUserGroup = yield prisma.user.findUnique({
            where: {
                id: userIdStr,
            },
            select: {
                Groups: true,
            },
        });
        const baseCondition = {
            OR: [
                {
                    userId: userIdStr,
                },
                {
                    groupId: (_m = currentUserGroup === null || currentUserGroup === void 0 ? void 0 : currentUserGroup.Groups) === null || _m === void 0 ? void 0 : _m.id,
                },
            ],
        };
        let priorityCondition = {};
        if (ticketPriorityId && typeof ticketPriorityId === 'string') {
            priorityCondition = {
                ticketPriorityId: ticketPriorityId,
            };
        }
        const getAllTickets = yield prisma.ticket.findMany({
            where: Object.assign(Object.assign(Object.assign({}, baseCondition), priorityCondition), { TicketCompanies: {
                    some: {
                        companyId: companyId,
                    },
                } }),
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
            include: {
                ticketCategory: true,
                ticketLocation: true,
                ticketPriority: true,
                ticketType: true,
                User: true,
                TicketEvaluation: true,
                TicketCompanies: {
                    include: {
                        company: true,
                    },
                },
                images: true,
                usedItems: {
                    include: {
                        DepotItem: true,
                    },
                },
                Equipments: {
                    include: {
                        equipment: true,
                    },
                },
            },
        });
        const globalEquipmentUsageCount = {};
        getAllTickets.forEach((ticket) => {
            ticket.Equipments.forEach((equipment) => {
                const eqId = equipment.equipmentId;
                if (globalEquipmentUsageCount[eqId]) {
                    globalEquipmentUsageCount[eqId]++;
                }
                else {
                    globalEquipmentUsageCount[eqId] = 1;
                }
            });
        });
        const serializedTickets = getAllTickets.map((ticket) => {
            const { Equipments } = ticket, ticketWithoutEquipments = __rest(ticket, ["Equipments"]);
            const ticketWithEquipmentUsage = Object.assign(Object.assign({}, ticketWithoutEquipments), { usedItems: ticket.usedItems.map((usedItem) => {
                    const { DepotItem } = usedItem, rest = __rest(usedItem, ["DepotItem"]);
                    return Object.assign(Object.assign({}, rest), { name: DepotItem.name });
                }), equipmentUsage: Equipments.map((equipment) => {
                    const eqId = equipment.equipmentId;
                    const eqSerial = equipment.equipment.serialNumber;
                    const eqPatrimonyTag = equipment.equipment.patrimonyTag;
                    const eqName = equipment.equipment.name;
                    return {
                        equipmentId: eqId,
                        usageCount: globalEquipmentUsageCount[eqId] || 0,
                        equipmentSerial: eqSerial,
                        equipmentPatrimony: eqPatrimonyTag,
                        equipmentName: eqName,
                    };
                }) });
            return ticketWithEquipmentUsage;
        });
        return response.status(200).json({
            message: 'Tickets retrieved successfully',
            body: serializedTickets,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.put('/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = request.params.id;
        const userId = request.query.userId || request.body.userId;
        const requestBody = request.body;
        let updateData = {};
        if (!ticketId || !userId) {
            return response
                .status(400)
                .json({ message: 'Required parameters are missing.', error: true });
        }
        const loggedInUser = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (Array.isArray(requestBody.assignedTo)) {
            updateData.assignedTo = requestBody.assignedTo
                .map((tech) => `${tech.id}-${tech.name}`)
                .join(', ');
        }
        else if (requestBody.assignedTo &&
            typeof requestBody.assignedTo === 'object') {
            // Handle the case where only one technician is assigned
            updateData.assignedTo = `${requestBody.assignedTo.id}-${requestBody.assignedTo.name}`;
        }
        else {
            // Handle the case where no technician is assigned
            updateData.assignedTo = undefined;
        }
        let equipment;
        if (requestBody.patrimonyTag) {
            equipment = yield prisma.equipments.findUnique({
                where: { patrimonyTag: requestBody.patrimonyTag },
            });
            if (!equipment) {
                return response.status(400).json({
                    message: 'No equipment found for the provided patrimony tag.',
                    error: true,
                });
            }
        }
        const fields = [
            'description',
            'observationServiceExecuted',
            'equipaments',
            'images',
            'status',
            'userId',
            'timeEstimate',
            'isDelay',
        ];
        fields.forEach((field) => {
            if (requestBody[field]) {
                updateData[field] = requestBody[field];
            }
        });
        if (requestBody.ticketTypeId) {
            updateData.ticketType = {
                connect: {
                    id: requestBody.ticketTypeId,
                },
            };
        }
        if (requestBody.ticketCategoryId) {
            updateData.ticketCategory = {
                connect: {
                    id: requestBody.ticketCategoryId,
                },
            };
        }
        if (requestBody.ticketLocationId) {
            updateData.ticketLocation = {
                connect: {
                    id: requestBody.ticketLocationId,
                },
            };
        }
        if (requestBody.ticketPriorityId) {
            updateData.ticketPriority = {
                connect: {
                    id: requestBody.ticketPriorityId,
                },
            };
        }
        if (equipment) {
            updateData.Equipments = {
                upsert: {
                    where: {
                        ticketId_equipmentId: {
                            ticketId: ticketId,
                            equipmentId: equipment.id,
                        },
                    },
                    create: {
                        equipmentId: equipment.id,
                    },
                    update: {},
                },
            };
        }
        if (requestBody.status === 'closed') {
            if (!loggedInUser) {
                throw new Error(`Logged-in user not found.`);
            }
            updateData.closedBy = loggedInUser.name;
            updateData.closedAt = new Date();
        }
        if (requestBody.slaDefinitionId || requestBody.manualResolutionDueDate) {
            // Consultar a definição de SLA para o tipo e prioridade do ticket
            const slaDef = yield prisma.sLADefinition.findFirst({
                where: {
                    id: Number(requestBody.slaDefinitionId),
                },
            });
            if (!slaDef) {
                return response.status(400).json({
                    message: 'No SLA definition found for the provided ticket type, category, and priority.',
                    error: true,
                });
            }
            let resolutionDueDate = new Date();
            if (requestBody.manualResolutionDueDate) {
                resolutionDueDate = new Date(requestBody.manualResolutionDueDate); // Se manualResolutionDueDate for fornecido, use-o
            }
            else {
                resolutionDueDate.setHours(resolutionDueDate.getHours() + slaDef.resolutionTime); // Caso contrário, use o SLA padrão
            }
            // Atualize o timeEstimate com a resolutionDueDate
            updateData.timeEstimate = resolutionDueDate;
            // Vincular ao SLADefinition (se fornecido)
            if (requestBody.slaDefinitionId) {
                updateData.slaDefinitionId = Number(requestBody.slaDefinitionId);
            }
        }
        if (requestBody.ticketPriorityId) {
            const ticketPriority = yield prisma.ticketPriority.findUnique({
                where: {
                    id: requestBody.ticketPriorityId,
                },
            });
            if (!ticketPriority) {
                return response.status(400).json({
                    message: 'No ticket priority found for the provided ticketPriorityId.',
                    error: true,
                });
            }
            const slaDef = yield prisma.sLADefinition.findFirst({
                where: {
                    ticketPriority: ticketPriority.name,
                },
            });
            if (!slaDef) {
                return response.status(400).json({
                    message: 'No SLA definition found for the provided ticket priority.',
                    error: true,
                });
            }
            let resolutionDueDate = new Date();
            if (requestBody.manualResolutionDueDate) {
                resolutionDueDate = new Date(requestBody.manualResolutionDueDate);
            }
            else {
                resolutionDueDate.setHours(resolutionDueDate.getHours() + slaDef.resolutionTime);
            }
            updateData.timeEstimate = resolutionDueDate;
            if (requestBody.slaDefinitionId || slaDef.id) {
                updateData.SLADefinition = { connect: { id: slaDef.id } };
            }
        }
        const currentTicket = yield prisma.ticket.findUnique({
            where: { id: ticketId },
        });
        const isClosingTicket = requestBody.status === 'closed' && (currentTicket === null || currentTicket === void 0 ? void 0 : currentTicket.status) !== 'closed';
        const updatedTicket = yield prisma.ticket.update({
            where: { id: ticketId },
            data: updateData,
            include: {
                ticketCategory: true,
                ticketLocation: true,
                ticketPriority: true,
                ticketType: true,
                User: true,
            },
        });
        if (isClosingTicket) {
            const notificationData = {
                userId,
                ticketId,
                type: 'ticket_closed',
            };
            yield (0, notificationService_1.createNotification)(notificationData);
            yield (0, webhookService_1.closeTicketNotificationDiscord)(updatedTicket);
        }
        else {
            const notificationData = {
                userId,
                ticketId,
                type: 'ticket_updated',
            };
            yield (0, notificationService_1.createNotification)(notificationData);
            yield (0, webhookService_1.updateTicketNotificationDiscord)(updatedTicket);
        }
        return response.status(200).json({
            message: 'Ticket updated successfully',
            body: updatedTicket,
            error: false,
        });
    }
    catch (err) {
        console.error('Error occurred:', err);
        return response.status(500).json({ message: err.message, error: true });
    }
}));
router.post('/response', multer_1.uploadTicketResponse.array('images'), (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId, userId, content, type } = request.body;
        const files = request.files;
        if (!ticketId || !userId || !type) {
            return response
                .status(400)
                .json({ message: 'Campos obrigatórios em falta' });
        }
        if (typeof content !== 'string') {
            return response
                .status(400)
                .json({ message: 'O conteúdo deve ser uma string' });
        }
        const serverUrl = `http://${request.headers.host}/uploads/tickets_img`;
        const ticketResponse = yield prisma.ticketResponse.create({
            data: {
                content: content ? content : '',
                type: type,
                userId: userId,
                ticketId: ticketId,
                ticketImages: {
                    create: files.map((file) => ({
                        path: `${serverUrl}/${file.filename}`,
                    })),
                },
            },
            include: {
                ticketImages: true,
            },
        });
        // Após adicionar a resposta ao ticket
        const notificationData = {
            userId: userId,
            ticketId: ticketId,
            type: 'ticket_response_added',
        };
        yield (0, notificationService_1.createNotification)(notificationData);
        return response.status(200).json({
            message: 'Resposta adicionada com sucesso',
            body: ticketResponse,
            error: false,
        });
    }
    catch (err) {
        console.error('Erro ao criar resposta ao ticket:', err.message);
        return response.status(500).json({ message: 'Erro interno do servidor' });
    }
}));
router.get('/:id/responses', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = request.params.id;
        const companyId = request.query.companyId;
        if (!companyId || typeof companyId !== 'string') {
            return response
                .status(400)
                .json({ message: 'Company ID is required.', error: true });
        }
        const ticketResponses = yield prisma.ticketResponse.findMany({
            where: {
                ticketId: ticketId,
            },
            include: {
                ticketImages: true,
                User: true,
            },
        });
        return response.status(200).json({
            message: 'Fetched ticket responses successfully',
            body: ticketResponses,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.post('/evaluate', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ticketId, rating, comments, userId } = request.body;
        // Validar a classificação
        if (rating < 1 || rating > 5) {
            return response.status(400).json({
                message: 'Rating must be between 1 and 5',
                error: true,
            });
        }
        // Verificar se o chamado existe
        const ticketExists = yield prisma.ticket.findUnique({
            where: {
                id: ticketId,
            },
        });
        if (!ticketExists) {
            return response.status(404).json({
                message: 'Ticket not found',
                error: true,
            });
        }
        const ticketEvaluation = yield prisma.ticketEvaluation.create({
            data: {
                ticketId: ticketId,
                rating: rating,
                comments: comments,
                userId,
            },
        });
        return response.status(201).json({
            message: 'Evaluation created successfully',
            body: ticketEvaluation,
            error: false,
        });
    }
    catch (err) {
        console.error('Error occurred:', err);
        return response.status(500).json({ message: 'Internal Server Error' });
    }
}));
router.get('/:id/evaluations', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = request.params.id;
        const ticketEvaluations = yield prisma.ticketEvaluation.findMany({
            where: {
                ticketId: ticketId,
            },
        });
        return response.status(200).json({
            message: 'Fetched ticket evaluations successfully',
            body: ticketEvaluations,
            error: false,
        });
    }
    catch (err) {
        return response.status(500).json(err);
    }
}));
router.get('/patrimony', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { locationId } = request.query;
    if (!locationId || typeof locationId !== 'string') {
        return response
            .status(400)
            .json({ error: 'locationId is required and must be a string' });
    }
    try {
        const equipments = yield prisma.equipments.findMany({
            where: {
                locationId: locationId,
            },
            select: {
                id: true,
                name: true,
                model: true,
                serialNumber: true,
                patrimonyTag: true,
                type: true,
            },
        });
        if (equipments.length === 0) {
            return response
                .status(204)
                .json({ message: 'No equipment found for this location.' });
        }
        return response.status(200).json(equipments);
    }
    catch (error) {
        console.error('An error occurred while retrieving equipment:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}));
router.put('/sign/:id', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = request.path;
        const serealizedTicket = ticketId.split('/');
        const { userId, signAs } = request.body;
        if (!ticketId || !userId || !signAs) {
            return response
                .status(400)
                .json({ message: 'Required parameters are missing.', error: true });
        }
        const loggedInUser = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!loggedInUser) {
            throw new Error('User not found or not logged in.');
        }
        let updateData = {};
        if (signAs === 'tech') {
            updateData.ticketWasSignedTech = true;
        }
        else if (signAs === 'user') {
            updateData.ticketWasSignedUser = true;
        }
        else {
            return response.status(400).json({
                message: "Invalid 'signAs' value. Must be 'tech' or 'user'.",
                error: true,
            });
        }
        const updatedTicket = yield prisma.ticket.update({
            where: { id: String(serealizedTicket[2]) },
            data: updateData,
        });
        return response.status(200).json({
            message: 'Ticket signed successfully',
            body: updatedTicket,
            error: false,
        });
    }
    catch (err) {
        console.error('Error occurred:', err);
        return response.status(500).json({ message: err.message, error: true });
    }
}));
exports.default = router;
