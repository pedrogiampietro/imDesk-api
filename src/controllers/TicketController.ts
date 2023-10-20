import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadTickets } from "../middlewares/multer";

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

      const ticketImages = ticket_images.map((image) => ({
        path: `http://${request.headers.host}/uploads/tickets_img/${image.filename}`,
      }));

      const ticketCompanies = companyIds.map((companyId: any) => ({
        companyId: companyId,
      }));

      const createTicket = await prisma.ticket.create({
        data: {
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
          Equipments: {
            create: [
              {
                equipmentId: equipmentTicketLocationId,
              },
            ],
          },
          timeEstimate: resolutionDueDate,
          manualResolutionDueDate: manualResolutionDueDate
            ? new Date(manualResolutionDueDate)
            : null,
          userId,
          TicketCompanies: {
            create: ticketCompanies,
          },
        },
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
      };

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

    getAllTickets.forEach((ticket) => {
      ticket.Equipments.forEach((equipment) => {
        const eqId = equipment.equipmentId;

        if (globalEquipmentUsageCount[eqId]) {
          globalEquipmentUsageCount[eqId]++;
        } else {
          globalEquipmentUsageCount[eqId] = 1;
        }
      });
    });

    const serializedTickets = getAllTickets.map((ticket) => {
      const { Equipments, ...ticketWithoutEquipments } = ticket;

      const ticketWithEquipmentUsage = {
        ...ticketWithoutEquipments,
        usedItems: ticket.usedItems.map((usedItem) => {
          const { DepotItem, ...rest } = usedItem;
          return {
            ...rest,
            name: DepotItem.name,
          };
        }),
        equipmentUsage: Equipments.map((equipment) => {
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

    if (Array.isArray(requestBody.assignedTo)) {
      updateData.assignedTo = requestBody.assignedTo
        .map((tech: any) => `${tech.id}-${tech.name}`)
        .join(", ");
    } else if (
      requestBody.assignedTo &&
      typeof requestBody.assignedTo === "object"
    ) {
      // Handle the case where only one technician is assigned
      updateData.assignedTo = `${requestBody.assignedTo.id}-${requestBody.assignedTo.name}`;
    } else {
      // Handle the case where no technician is assigned
      updateData.assignedTo = undefined;
    }

    const fields = [
      "description",
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

router.post("/response", async (request: Request, response: Response) => {
  try {
    const { ticketId, userId, content, type } =
      request.body as ITicketResponseRequestBody;

    if (!ticketId || !userId || !content || !type) {
      return response.status(400).json({ message: "Missing required fields" });
    }

    if (typeof content !== "string") {
      return response.status(400).json({ message: "Content must be a string" });
    }

    const ticketResponse = await prisma.ticketResponse.create({
      data: {
        content: content,
        type: type,
        userId: userId,
        ticketId: ticketId,
      },
    });

    return response.status(200).json({
      message: "Response added successfully",
      body: ticketResponse,
      error: false,
    });
  } catch (err: any) {
    console.error("Error while creating ticket response:", err.message);
    return response.status(500).json({ message: "Internal Server Error" });
  }
});

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

// Criação de avaliação
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

// Listagem de avaliações para um chamado específico
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
  // Extrai o 'locationId' da string de consulta
  const { locationId } = request.query;

  // Verifica se 'locationId' está presente
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
        .status(404)
        .json({ message: "No equipment found for this location." });
    }

    return response.status(200).json(equipments);
  } catch (error) {
    console.error("An error occurred while retrieving equipment:", error);

    return response.status(500).json({ error: "Internal server error" });
  }
});

export default router;
