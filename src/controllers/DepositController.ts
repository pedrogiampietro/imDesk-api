import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Criação de um novo depósito
router.post("/", async (request: Request, response: Response) => {
  const { name, companyId, location } = request.body;

  if (!name || !companyId) {
    return response.status(400).json({
      message:
        "Name, companyId e userId são obrigatórios para criar um depósito",
      error: true,
    });
  }

  try {
    const depot = await prisma.depot.create({
      data: {
        name,
        companyId,
        location,
      },
    });

    return response.status(200).json({
      message: "Depósito criado com sucesso",
      body: depot,
      error: false,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json(err);
  }
});

// Listagem de todos os depósitos de uma empresa
router.get("/", async (request: Request, response: Response) => {
  const { companyId } = request.query;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "CompanyId é obrigatório para buscar depósitos",
      error: true,
    });
  }

  try {
    const depots = await prisma.depot.findMany({
      where: {
        companyId,
      },
      include: {
        Company: true,
        DepotUsers: {
          include: {
            User: true,
          },
        },
      },
    });

    // Mapear os depósitos para incluir os usuários no formato desejado
    const depotsWithUsers = depots.map((depot) => ({
      ...depot,
      users: depot.DepotUsers.map((depotUser) => depotUser.User),
    }));

    return response.status(200).json({
      message: "Depósitos encontrados",
      body: depotsWithUsers,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

// Atualização de um depósito
router.put("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;
  const { name, userId } = request.body;

  try {
    const depot = await prisma.depot.update({
      where: {
        id,
      },
      data: {
        name,
      },
      include: {
        Company: true,
        DepotUsers: {
          include: {
            User: true,
          },
        },
      },
    });

    const existingDepotUsers = await prisma.depotUser.findMany({
      where: {
        depotId: id,
      },
    });

    const usersToRemove = existingDepotUsers.filter(
      (depotUser) => !userId.includes(depotUser.userId)
    );
    for (let user of usersToRemove) {
      await prisma.depotUser.delete({
        where: {
          depotId_userId: {
            depotId: id,
            userId: user.userId,
          },
        },
      });
    }

    for (let usersId of userId) {
      const existingDepotUser = existingDepotUsers.find(
        (depotUser) => depotUser.userId === usersId
      );

      if (!existingDepotUser) {
        await prisma.depotUser.create({
          data: {
            depotId: id,
            userId: usersId,
          },
        });
      }
    }

    // Busque o Depot atualizado do banco de dados
    const updatedDepot = await prisma.depot.findUnique({
      where: {
        id,
      },
      include: {
        Company: true,
        DepotUsers: {
          include: {
            User: true,
          },
        },
      },
    });

    return response.status(200).json({
      message: "Depósito atualizado com sucesso",
      body: updatedDepot,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

// Deleção de um depósito
router.delete("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    await prisma.depot.delete({
      where: {
        id,
      },
    });
    return response.status(200).json({
      message: "Depósito deletado com sucesso",
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
