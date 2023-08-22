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

export default router;
