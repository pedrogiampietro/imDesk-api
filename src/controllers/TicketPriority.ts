import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { name, companyIds } = request.body;

  if (!companyIds || companyIds.length === 0) {
    return response
      .status(400)
      .json({ message: "At least one Company ID is required.", error: true });
  }

  try {
    // Verifique se o ticketPriority com o nome fornecido já existe
    const existingTicketPriority = await prisma.ticketPriority.findFirst({
      where: { name: name },
    });

    if (existingTicketPriority) {
      return response.status(400).json({
        message: "A ticket priority with this name already exists.",
        error: true,
      });
    }

    const createTicketPriority = await prisma.ticketPriority.create({
      data: {
        name: name,
        TicketPriorityCompanies: {
          create: companyIds.map((companyId: string) => ({
            companyId: companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Ticket priority created successfully",
      body: createTicketPriority,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  const companyId = request.query.companyId;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "CompanyId é obrigatório para buscar prioridades de tickets",
      error: true,
    });
  }

  try {
    const getAllTicketPriority = await prisma.ticketPriority.findMany({
      where: {
        TicketPriorityCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
    });

    return response.status(200).json({
      message: "Ticket priority found",
      body: getAllTicketPriority,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/find-by-id/", async (request: Request, response: Response) => {
  const { id } = request.query;

  try {
    const getPriority = await prisma.ticketPriority.findUnique({
      where: {
        id: String(id),
      },
    });

    return response.status(200).json({
      message: "Priority found",
      body: getPriority,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.patch("/update-priority/:id", async (request, response) => {
  const priorityId = request.params.id;

  const { name, companyIds } = request.body;

  if (!priorityId || !companyIds) {
    return response
      .status(400)
      .json("ID e Empresas são obrigatórios para atualização");
  }

  try {
    const priority = await prisma.ticketPriority.findUnique({
      where: { id: String(priorityId) },
    });

    if (!priority) {
      return response.status(404).json("Usuário não encontrado");
    }

    const updatePriority = await prisma.ticketPriority.update({
      where: { id: String(priorityId) },
      data: {
        name,
        TicketPriorityCompanies: {
          deleteMany: {},
          create: companyIds.map((companyId: any) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Priority updated successfully",
      body: updatePriority,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
