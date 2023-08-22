import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { name, companyIds } = request.body;

  if (
    !name ||
    !companyIds ||
    !Array.isArray(companyIds) ||
    companyIds.length === 0
  ) {
    return response.status(400).json({
      message: "Name e companyIds são obrigatórios para criar uma localização",
      error: true,
    });
  }

  try {
    const createLocation = await prisma.locations.create({
      data: {
        name: name,
        LocationCompanies: {
          create: companyIds.map((companyId: string) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(201).json({
      message: "Location created successfully",
      body: createLocation,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  const { companyId } = request.query;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "Company ID is required and must be a string.",
      error: true,
    });
  }

  try {
    const getAllLocation = await prisma.locations.findMany({
      where: {
        LocationCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      include: {
        LocationCompanies: true,
      },
    });

    return response.status(200).json({
      message: "Locations found",
      body: getAllLocation,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
