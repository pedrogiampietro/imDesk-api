import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request, response) => {
  const { name, model, serialNumber, patrimonyTag, type, companyId, groupId } =
    request.body;

  try {
    const newEquipment = await prisma.equipments.create({
      data: {
        name,
        model,
        serialNumber,
        patrimonyTag,
        type,
      },
    });

    if (newEquipment) {
      await prisma.equipmentCompany.create({
        data: {
          equipmentId: newEquipment.id,
          companyId: companyId,
          groupId: groupId,
        },
      });
    }

    return response.status(201).json({
      message: "Equipamento criado com sucesso!",
      body: newEquipment,
      error: false,
    });
  } catch (err) {
    console.error(err);
    return response
      .status(500)
      .json({ message: "Ocorreu um erro ao criar o equipamento." });
  }
});

router.put("/:id", async (request, response) => {
  const id = request.path;
  const { name, model, serialNumber, patrimonyTag, type, companyId, groupId } =
    request.body;

  try {
    const equipment = await prisma.equipments.findUnique({
      where: {
        id: id,
      },
    });

    if (!equipment) {
      return response
        .status(404)
        .json({ message: "Equipamento não encontrado." });
    }

    const updatedEquipment = await prisma.equipments.update({
      where: {
        id: id,
      },
      data: {
        name,
        model,
        serialNumber,
        patrimonyTag,
        type,
      },
    });

    if (companyId || groupId) {
      await prisma.equipmentCompany.updateMany({
        where: {
          equipmentId: id,
        },
        data: {
          ...(companyId ? { companyId: companyId } : {}),
          ...(groupId ? { groupId: groupId } : {}),
        },
      });
    }

    return response.status(200).json({
      message: "Equipamento atualizado com sucesso!",
      body: updatedEquipment,
    });
  } catch (err: any) {
    console.error(err);
    return response.status(500).json({
      message: "Ocorreu um erro ao atualizar o equipamento.",
      error: err.message,
    });
  }
});

router.get("/", async (request: Request, response: Response) => {
  const { companyId } = request.query as any;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "CompanyId é obrigatório para buscar prioridades de equipaments",
      error: true,
    });
  }

  try {
    const getAllEquipaments = await prisma.equipments.findMany({
      include: {
        EquipmentCompanies: true,
      },
      where: {
        EquipmentCompanies: {
          some: {
            companyId: companyId,
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
