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
    const createTicketType = await prisma.ticketType.create({
      data: {
        name: name,
        TicketTypeCompanies: {
          create: companyIds.map((companyId: string) => ({
            companyId: companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Ticket type created successfully",
      body: createTicketType,
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
      message: "CompanyId é obrigatório para buscar tipos de tickets",
      error: true,
    });
  }

  try {
    const getAllTicketTypes = await prisma.ticketType.findMany({
      where: {
        TicketTypeCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      include: {
        TicketTypeCompanies: true,
      },
    });

    return response.status(200).json({
      message: "Ticket types found",
      body: getAllTicketTypes,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/find-by-id/", async (request: Request, response: Response) => {
  const { id } = request.query;

  try {
    const getType = await prisma.ticketType.findUnique({
      where: {
        id: String(id),
      },
    });

    return response.status(200).json({
      message: "Type found",
      body: getType,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.patch("/update-type/:id", async (request, response) => {
  const typeId = request.params.id;

  const { name, companyIds } = request.body;

  if (!typeId || !companyIds) {
    return response
      .status(400)
      .json("ID e Empresas são obrigatórios para atualização");
  }

  try {
    const type = await prisma.ticketType.findUnique({
      where: { id: String(typeId) },
    });

    if (!type) {
      return response.status(404).json("Usuário não encontrado");
    }

    const updateType = await prisma.ticketType.update({
      where: { id: String(typeId) },
      data: {
        name,
        TicketTypeCompanies: {
          deleteMany: {},
          create: companyIds.map((companyId: any) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Type updated successfully",
      body: updateType,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
