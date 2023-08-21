import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

interface IRequestBody {
  ticket_description: string;
  ticket_type: string;
  ticket_category: string;
  ticket_priority: string;
  ticket_location: string;
  companyId: string;
}

interface IRequestQuery {
  userId: string;
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

router.post("/", async (request: Request, response: Response) => {
  try {
    const {
      ticket_description,
      ticket_type,
      ticket_category,
      ticket_priority,
      ticket_location,
      companyIds,
    } = request.body as IRequestBody;

    const { userId } = request.query as unknown as IRequestQuery;

    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: userId,
        companyId: companyId,
      },
    });

    if (!userCompany) {
      return response.status(404).json({
        message: "User is not associated with the provided company",
        error: true,
      });
    }

    const createTicket = await prisma.ticket.create({
      data: {
        description: ticket_description,
        ticketTypeId: ticket_type,
        ticketCategoryId: ticket_category,
        ticketLocationId: ticket_location,
        ticketPriorityId: ticket_priority,
        status: "new",
        assignedTo: [],
        equipaments: [],
        images: [],
        userId,
        TicketCompanies: c,
      },
      include: {
        ticketCategory: true,
        ticketLocation: true,
        ticketPriority: true,
        ticketType: true,
        User: {
          include: {
            UserCompanies: true,
          },
        },
      },
    });

    const ticketCategoryId = {
      id: createTicket.ticketCategoryId.id,
      name: createTicket.ticketCategoryId.name,
      childrenName: createTicket.ticketCategoryId.childrenName,
      defaultText: createTicket.ticketCategoryId.defaultText,
    };

    const ticketLocationId = {
      id: createTicket.ticketLocationId.id,
      name: createTicket.ticketLocationId.name,
    };

    const ticketPriorityId = {
      id: createTicket.ticketPriorityId.id,
      name: createTicket.ticketPriorityId.name,
    };

    const ticketTypeId = {
      id: createTicket.ticketTypeId.id,
      name: createTicket.ticketTypeId.name,
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
      equipaments: createTicket.equipaments,
      images: createTicket.images,
      assignedToAt: createTicket.assignedToAt,
      closedBy: createTicket.closedBy,
      closedAt: createTicket.closedAt,
      status: createTicket.status,
      timeEstimate: createTicket.timeEstimate,
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
});

router.get("/", async (request: Request, response: Response) => {
  try {
    const { companyId } = request.query;

    if (!companyId || typeof companyId !== "string") {
      return response
        .status(400)
        .json({ message: "Company ID is required.", error: true });
    }

    const getAllTickets = await prisma.ticket.findMany({
      where: {
        companyId: companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        ticketCategoryId: true,
        ticketLocationId: true,
        ticketPriorityId: true,
        ticketTypeId: true,
        User: true,
        TicketEvaluation: true,
      },
    });

    return response.status(200).json({
      message: "Tickets retrieved successfully",
      body: getAllTickets,
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
      updateData.assignedTo = null;
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
      updateData.ticketTypeId = {
        connect: {
          id: requestBody.ticketTypeId,
        },
      };
    }

    if (requestBody.ticketCategoryId) {
      updateData.ticketCategoryId = {
        connect: {
          id: requestBody.ticketCategoryId,
        },
      };
    }

    if (requestBody.ticketLocationId) {
      updateData.ticketLocationId = {
        connect: {
          id: requestBody.ticketLocationId,
        },
      };
    }

    if (requestBody.ticketPriorityId) {
      updateData.ticketPriorityId = {
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

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        ticketCategoryId: true,
        ticketLocationId: true,
        ticketPriorityId: true,
        ticketTypeId: true,
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

export default router;
