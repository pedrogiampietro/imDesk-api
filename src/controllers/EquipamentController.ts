import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { userId } = request.query;
  const { name, model, serialNumber, patrimonyTag, type, companyIds } =
    request.body;

  if (!companyIds || !Array.isArray(companyIds)) {
    return response.status(400).json({
      message: "CompanyIds are required and should be an array.",
      error: true,
    });
  }

  // Filter and cast companyIds to an array of strings
  const filteredCompanyIds = companyIds.filter((id) => typeof id === "string");

  // Check if filteredCompanyIds is empty after filtering
  if (filteredCompanyIds.length === 0) {
    return response.status(400).json({
      message: "CompanyIds should be an array of strings.",
      error: true,
    });
  }

  try {
    const createEquipament = await prisma.equipments.create({
      data: {
        name,
        model,
        serialNumber,
        patrimonyTag,
        type,
        EquipmentCompanies: {
          create: filteredCompanyIds.map((companyId) => ({
            companyId: companyId,
            userId: String(userId),
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Equipamento criado com sucesso",
      body: createEquipament,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  const { companyIds } = request.query as any;

  if (!companyIds || !Array.isArray(companyIds)) {
    return response.status(400).json({
      message: "CompanyIds are required and should be an array.",
      error: true,
    });
  }

  // Filter and cast companyIds to an array of strings
  const filteredCompanyIds = companyIds.filter(
    (id: any) => typeof id === "string"
  );

  // Check if filteredCompanyIds is empty after filtering
  if (filteredCompanyIds.length === 0) {
    return response.status(400).json({
      message: "CompanyIds should be an array of strings.",
      error: true,
    });
  }

  try {
    const getAllEquipaments = await prisma.equipments.findMany({
      where: {
        EquipmentCompanies: {
          some: {
            companyId: {
              in: filteredCompanyIds,
            },
          },
        },
      },
      include: {
        EquipmentCompanies: {
          include: {
            company: true,
          },
        },
      },
    });

    return response.status(200).json({
      message: "Equipamento encontrado",
      body: getAllEquipaments,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
