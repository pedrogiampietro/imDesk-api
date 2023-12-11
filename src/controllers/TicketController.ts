import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadTickets, uploadTicketResponse } from "../middlewares/multer";
import {
  closeTicketNotificationDiscord,
  createTicketNotificationDiscord,
  updateTicketNotificationDiscord,
} from "../services/webhookService";
import { createNotification } from "../services/notificationService";

const prisma = new PrismaClient();
const router = express.Router();

interface IRequestQuery {
  userId: string;
  companyIds: string[];
}

interface ITicketResponseRequestBody {
  ticketId: string;
  userId: string;
  content: string;
  type: string;
  companyId: string;
}

interface ITicketEvaluationRequestBody {
  ticketId: string;
  rating: number;
  comments: string;
  userId: string;
}

router.post(
  "/",
  uploadTickets.array("ticket_images"),
  async (request: Request, response: Response) => {
    try {
      const { userId } = request.query as unknown as IRequestQuery;
      const companyIds = JSON.parse(request.body.companyIds as string);
      const equipmentTicketLocationId = JSON.parse(
        request.body.equipmentTicketLocationId as string
      );
      const values = JSON.parse(request.body.values as string);
      const ticket_images = request.files as Express.Multer.File[];

      const {
        ticket_description,
        ticket_type,
        ticket_category,
        ticket_priority,
        ticket_location,
        manualResolutionDueDate,
      } = values;

      if (!companyIds || companyIds.length === 0) {
        return response.status(400).json({
          message: "Company IDs are required and must be an array.",
          error: true,
        });
      }

      const userCompanies = await prisma.userCompany.findMany({
        where: {
          userId: userId,
          companyId: {
            in: companyIds,
          },
        },
      });

      if (userCompanies.length === 0) {
        return response.status(404).json({
          message: "User is not associated with the provided companies",
          error: true,
        });
      }

      const currentUserGroup = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          groupId: true,
        },
      });

      const ticketPriorityObj = await prisma.ticketPriority.findUnique({
        where: {
          id: ticket_priority,
        },
      });

      if (!ticketPriorityObj) {
        return response.status(400).json({
          message: "Invalid ticket type, category, or priority ID provided.",
          error: true,
        });
      }

      const slaDef = await prisma.sLADefinition.findFirst({
        where: {
          ticketPriority: ticketPriorityObj.name,
        },
      });

      if (!slaDef) {
        return response.status(400).json({
          message: "No SLA definition found for the provided ticket priority.",
          error: true,
        });
      }

      let resolutionDueDate = new Date();
      if (manualResolutionDueDate) {
        resolutionDueDate = new Date(manualResolutionDueDate); // Se manualResolutionDueDate for fornecido, use-o
      } else {
        resolutionDueDate.setHours(
          resolutionDueDate.getHours() + slaDef.resolutionTime
        ); // Caso contrário, use o SLA padrão
      }

      const ticketImages = ticket_images.map((image: any) => ({
        path: `http://${request.headers.host}/uploads/tickets_img/${image.filename}`,
      }));

      const ticketCompanies = companyIds.map((companyId: any) => ({
        companyId: companyId,
      }));

      const uuidValidationRegex = new RegExp(
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
      );

      const isValidEquipmentId =
        equipmentTicketLocationId &&
        uuidValidationRegex.test(equipmentTicketLocationId);

      const ticketData = {
        description: ticket_description,
        ticketTypeId: ticket_type,
        ticketCategoryId: ticket_category,
        ticketLocationId: ticket_location,
        ticketPriorityId: ticket_priority,
        status: "new",
        assignedTo: [],
        images: {
          create: ticketImages,
        },
        groupId: currentUserGroup?.groupId,
        timeEstimate: resolutionDueDate,
        manualResolutionDueDate: manualResolutionDueDate
          ? new Date(manualResolutionDueDate)
          : null,
        userId,
        TicketCompanies: {
          create: ticketCompanies,
        },

        ...(isValidEquipmentId && {
          Equipments: {
            create: [
              {
                equipmentId: equipmentTicketLocationId,
              },
            ],
          },
        }),
      };

      const createTicket = await prisma.ticket.create({
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
        id: createTicket.User?.id,
        username: createTicket.User?.username,
        name: createTicket.User?.name,
        email: createTicket.User?.email,
        password: createTicket.User?.password,
        phone: createTicket.User?.phone,
        ramal: createTicket.User?.ramal,
        sector: createTicket.User?.sector,
        createdAt: createTicket.User?.createdAt,
        updatedAt: createTicket.User?.updatedAt,
        Company: createTicket.User?.UserCompanies,
      };

      const equipmentUsageCounts = await prisma.ticketEquipments.groupBy({
        by: ["equipmentId"],
        _count: {
          equipmentId: true,
        },
        where: {
          equipmentId: {
            in: createTicket.Equipments.map(
              (equipment) => equipment.equipmentId
            ),
          },
        },
      });

      const usageCountMap = equipmentUsageCounts.reduce(
        (map: any, item: any) => {
          map[item.equipmentId] = item._count.equipmentId;
          return map;
        },
        {}
      );

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
        type: "new_ticket",
      };

      await createTicketNotificationDiscord(responseObj);
      await createNotification(data);

      const groupName = process.env.GROUP_NAME || "NOT FOUND";

      const group = await prisma.group.findFirst({
        where: {
          name: groupName,
        },
      });

      if (group) {
        const newId = createTicket.id.split("-");
        await prisma.emailQueue.create({
          data: {
            to: group.email,
            subject: "Novo Chamado Aberto",
            text: `Um novo chamado foi criado: #${newId[0]}, ${createTicket.description}`,
          },
        });
      } else {
        console.error(`Grupo ${groupName} não encontrado`);
      }

      return response.status(200).json({
        message: "Ticket created successfully",
        body: responseObj,
        error: false,
      });
    } catch (err) {
      return response.status(500).json(err);
    }
  }
);

router.get("/", async (request: Request, response: Response) => {
  try {
    const { companyId, currentUserId, ticketPriorityId } = request.query;

    if (!companyId || typeof companyId !== "string") {
      return response.status(400).json({
        message: "Company ID is required and must be a string.",
        error: true,
      });
    }

    const userIdStr = String(currentUserId);

    const currentUserGroup = await prisma.user.findUnique({
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
          groupId: currentUserGroup?.Groups?.id,
        },
      ],
    };

    let priorityCondition = {};
    if (ticketPriorityId && typeof ticketPriorityId === "string") {
      priorityCondition = {
        ticketPriorityId: ticketPriorityId,
      };
    }

    const getAllTickets = await prisma.ticket.findMany({
      where: {
        ...baseCondition,
        ...priorityCondition,
        TicketCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

    const globalEquipmentUsageCount = {} as any;

    getAllTickets.forEach((ticket: any) => {
      ticket.Equipments.forEach((equipment: any) => {
        const eqId = equipment.equipmentId;

        if (globalEquipmentUsageCount[eqId]) {
          globalEquipmentUsageCount[eqId]++;
        } else {
          globalEquipmentUsageCount[eqId] = 1;
        }
      });
    });

    const serializedTickets = getAllTickets.map((ticket: any) => {
      const { Equipments, ...ticketWithoutEquipments } = ticket;

      const ticketWithEquipmentUsage = {
        ...ticketWithoutEquipments,
        usedItems: ticket.usedItems.map((usedItem: any) => {
          const { DepotItem, ...rest } = usedItem;
          return {
            ...rest,
            name: DepotItem.name,
          };
        }),
        equipmentUsage: Equipments.map((equipment: any) => {
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
        }),
      };

      return ticketWithEquipmentUsage;
    });

    return response.status(200).json({
      message: "Tickets retrieved successfully",
      body: serializedTickets,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.put("/:id", async (request: Request, response: Response) => {
  try {
    const ticketId = request.params.id;
    const userId = request.query.userId || request.body.userId;
    const requestBody = request.body;
    let updateData: Record<string, any> = {};

    if (!ticketId || !userId) {
      return response
        .status(400)
        .json({ message: "Required parameters are missing.", error: true });
    }

    const loggedInUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    let equipment;
    if (requestBody.patrimonyTag) {
      equipment = await prisma.equipments.findUnique({
        where: { patrimonyTag: requestBody.patrimonyTag },
      });

      if (!equipment) {
        return response.status(400).json({
          message: "No equipment found for the provided patrimony tag.",
          error: true,
        });
      }
    }

    const fields = [
      "description",
      "observationServiceExecuted",
      "equipaments",
      "images",
      "status",
      "userId",
      "timeEstimate",
      "isDelay",
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

    if (requestBody.status === "closed") {
      if (!loggedInUser) {
        throw new Error(`Logged-in user not found.`);
      }
      updateData.closedBy = loggedInUser.name;
      updateData.closedAt = new Date();
    }

    if (requestBody.slaDefinitionId || requestBody.manualResolutionDueDate) {
      // Consultar a definição de SLA para o tipo e prioridade do ticket
      const slaDef = await prisma.sLADefinition.findFirst({
        where: {
          id: Number(requestBody.slaDefinitionId),
        },
      });

      if (!slaDef) {
        return response.status(400).json({
          message:
            "No SLA definition found for the provided ticket type, category, and priority.",
          error: true,
        });
      }

      let resolutionDueDate = new Date();
      if (requestBody.manualResolutionDueDate) {
        resolutionDueDate = new Date(requestBody.manualResolutionDueDate); // Se manualResolutionDueDate for fornecido, use-o
      } else {
        resolutionDueDate.setHours(
          resolutionDueDate.getHours() + slaDef.resolutionTime
        ); // Caso contrário, use o SLA padrão
      }

      // Atualize o timeEstimate com a resolutionDueDate
      updateData.timeEstimate = resolutionDueDate;

      // Vincular ao SLADefinition (se fornecido)
      if (requestBody.slaDefinitionId) {
        updateData.slaDefinitionId = Number(requestBody.slaDefinitionId);
      }
    }

    if (requestBody.ticketPriorityId) {
      const ticketPriority = await prisma.ticketPriority.findUnique({
        where: {
          id: requestBody.ticketPriorityId,
        },
      });

      if (!ticketPriority) {
        return response.status(400).json({
          message:
            "No ticket priority found for the provided ticketPriorityId.",
          error: true,
        });
      }

      const slaDef = await prisma.sLADefinition.findFirst({
        where: {
          ticketPriority: ticketPriority.name,
        },
      });

      if (!slaDef) {
        return response.status(400).json({
          message: "No SLA definition found for the provided ticket priority.",
          error: true,
        });
      }

      let resolutionDueDate = new Date();
      if (requestBody.manualResolutionDueDate) {
        resolutionDueDate = new Date(requestBody.manualResolutionDueDate);
      } else {
        resolutionDueDate.setHours(
          resolutionDueDate.getHours() + slaDef.resolutionTime
        );
      }

      updateData.timeEstimate = resolutionDueDate;

      if (requestBody.slaDefinitionId || slaDef.id) {
        updateData.SLADefinition = { connect: { id: slaDef.id } };
      }
    }

    const currentTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (Array.isArray(requestBody.assignedTo)) {
      const existingAssignedTo = currentTicket?.assignedTo || [];
      const newAssignedToIds = requestBody.assignedTo.map(
        (tech: any) => tech.id
      );
      const updatedAssignedTo = [
        ...existingAssignedTo.filter((user: any) =>
          newAssignedToIds.includes(user.id)
        ),
        ...requestBody.assignedTo.map((tech: any) => `${tech.id}-${tech.name}`),
      ];

      updateData.assignedTo = updatedAssignedTo;
      updateData.assignedToAt = [
        ...existingAssignedTo.map(() => new Date()),
        ...requestBody.assignedTo.map(() => new Date()),
      ];
    } else if (
      requestBody.assignedTo &&
      typeof requestBody.assignedTo === "object"
    ) {
      const existingAssignedTo = currentTicket?.assignedTo || [];
      const updatedAssignedTo = [
        ...existingAssignedTo.filter(
          (user: any) => user.id !== requestBody.assignedTo.id
        ),
        `${requestBody.assignedTo.id}-${requestBody.assignedTo.name}`,
      ];

      updateData.assignedTo = updatedAssignedTo;
      updateData.assignedToAt = [
        ...existingAssignedTo.map(() => new Date()),
        new Date(),
      ];
    } else {
      updateData.assignedTo = undefined;
      updateData.assignedToAt = undefined;
    }

    const isClosingTicket =
      requestBody.status === "closed" && currentTicket?.status !== "closed";

    const updatedTicket = await prisma.ticket.update({
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
        type: "ticket_closed",
      };

      await createNotification(notificationData);
      await closeTicketNotificationDiscord(updatedTicket);
    } else {
      const notificationData = {
        userId,
        ticketId,
        type: "ticket_updated",
      };
      await createNotification(notificationData);
      await updateTicketNotificationDiscord(updatedTicket);
    }

    return response.status(200).json({
      message: "Ticket updated successfully",
      body: updatedTicket,
      error: false,
    });
  } catch (err: any) {
    console.error("Error occurred:", err);
    return response.status(500).json({ message: err.message, error: true });
  }
});

router.post(
  "/response",
  uploadTicketResponse.array("images"),
  async (request: Request, response: Response) => {
    try {
      const { ticketId, userId, content, type } =
        request.body as ITicketResponseRequestBody;

      const files = request.files as Express.Multer.File[];

      if (!ticketId || !userId || !type) {
        return response
          .status(400)
          .json({ message: "Campos obrigatórios em falta" });
      }

      if (typeof content !== "string") {
        return response
          .status(400)
          .json({ message: "O conteúdo deve ser uma string" });
      }

      const serverUrl = `http://${request.headers.host}/uploads/tickets_img`;

      const ticketResponse = await prisma.ticketResponse.create({
        data: {
          content: content ? content : "",
          type: type,
          userId: userId,
          ticketId: ticketId,
          ticketImages: {
            create: files.map((file: Express.Multer.File) => ({
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
        type: "ticket_response_added",
      };

      await createNotification(notificationData);

      return response.status(200).json({
        message: "Resposta adicionada com sucesso",
        body: ticketResponse,
        error: false,
      });
    } catch (err: any) {
      console.error("Erro ao criar resposta ao ticket:", err.message);
      return response.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

router.get("/:id/responses", async (request: Request, response: Response) => {
  try {
    const ticketId = request.params.id;
    const companyId = request.query.companyId;

    if (!companyId || typeof companyId !== "string") {
      return response
        .status(400)
        .json({ message: "Company ID is required.", error: true });
    }

    const ticketResponses = await prisma.ticketResponse.findMany({
      where: {
        ticketId: ticketId,
      },
      include: {
        ticketImages: true,
        User: true,
      },
    });

    return response.status(200).json({
      message: "Fetched ticket responses successfully",
      body: ticketResponses,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.post("/evaluate", async (request: Request, response: Response) => {
  try {
    const { ticketId, rating, comments, userId } =
      request.body as ITicketEvaluationRequestBody;

    // Validar a classificação
    if (rating < 1 || rating > 5) {
      return response.status(400).json({
        message: "Rating must be between 1 and 5",
        error: true,
      });
    }

    // Verificar se o chamado existe
    const ticketExists = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticketExists) {
      return response.status(404).json({
        message: "Ticket not found",
        error: true,
      });
    }

    const ticketEvaluation = await prisma.ticketEvaluation.create({
      data: {
        ticketId: ticketId,
        rating: rating,
        comments: comments,
        userId,
      },
    });

    return response.status(201).json({
      message: "Evaluation created successfully",
      body: ticketEvaluation,
      error: false,
    });
  } catch (err) {
    console.error("Error occurred:", err);
    return response.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:id/evaluations", async (request: Request, response: Response) => {
  try {
    const ticketId = request.params.id;

    const ticketEvaluations = await prisma.ticketEvaluation.findMany({
      where: {
        ticketId: ticketId,
      },
    });

    return response.status(200).json({
      message: "Fetched ticket evaluations successfully",
      body: ticketEvaluations,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/patrimony", async (request, response) => {
  const { locationId } = request.query;

  if (!locationId || typeof locationId !== "string") {
    return response
      .status(400)
      .json({ error: "locationId is required and must be a string" });
  }

  try {
    const equipments = await prisma.equipments.findMany({
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
        .json({ message: "No equipment found for this location." });
    }

    return response.status(200).json(equipments);
  } catch (error) {
    console.error("An error occurred while retrieving equipment:", error);

    return response.status(500).json({ error: "Internal server error" });
  }
});

router.put("/sign/:id", async (request: Request, response: Response) => {
  try {
    const ticketId = request.path;
    const serealizedTicket = ticketId.split("/");
    const { userId, signAs } = request.body;

    if (!ticketId || !userId || !signAs) {
      return response
        .status(400)
        .json({ message: "Required parameters are missing.", error: true });
    }

    const loggedInUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!loggedInUser) {
      throw new Error("User not found or not logged in.");
    }

    let updateData: Record<string, any> = {};
    if (signAs === "tech") {
      updateData.ticketWasSignedTech = true;
    } else if (signAs === "user") {
      updateData.ticketWasSignedUser = true;
    } else {
      return response.status(400).json({
        message: "Invalid 'signAs' value. Must be 'tech' or 'user'.",
        error: true,
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: String(serealizedTicket[2]) },
      data: updateData,
    });

    return response.status(200).json({
      message: "Ticket signed successfully",
      body: updatedTicket,
      error: false,
    });
  } catch (err: any) {
    console.error("Error occurred:", err);
    return response.status(500).json({ message: err.message, error: true });
  }
});

export default router;
