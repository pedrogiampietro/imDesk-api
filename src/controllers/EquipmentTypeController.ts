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
    const existingEquipmentType = await prisma.equipmentCompany.findFirst({});

    if (existingEquipmentType) {
      return response.status(400).json({
        message: "A ticket priority with this name already exists.",
        error: true,
      });
    }

    const createTicketPriority = await prisma.equipmentType.create({
      data: {
        name: name,
        companies: {
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
    const getAllTicketPriority = await prisma.equipmentType.findMany({
      include: {
        companies: true,
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

export default router;
