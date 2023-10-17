import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (request: Request, response: Response) => {
  const { companyId } = request.query;

  try {
    const groups = await prisma.group.findMany({
      where: {
        GroupCompanies: {
          some: {
            companyId: String(companyId),
          },
        },
      },
      include: {
        users: true,
      },
    });

    return response.status(201).json({
      message: "Group created successfully",
      body: groups,
      error: false,
    });
  } catch (err: any) {
    return response.status(500).json(err);
  }
});

router.post("/", async (request: Request, response: Response) => {
  const { name, companyIds } = request.body;

  if (
    !name ||
    !companyIds ||
    !Array.isArray(companyIds) ||
    companyIds.length === 0
  ) {
    return response.status(400).json({
      message: "Name e companyIds são obrigatórios para criar um grupo",
      error: true,
    });
  }

  try {
    const createGroup = await prisma.group.create({
      data: {
        name: name,
        GroupCompanies: {
          create: companyIds.map((companyId: string) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(201).json({
      message: "Group created and associated successfully",
      body: createGroup,
      error: false,
    });
  } catch (err: any) {
    return response.status(500).json({
      message: "Error while creating group",
      error: err.message,
    });
  }
});

router.delete("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    await prisma.group.delete({
      where: {
        id: parseInt(id),
      },
    });

    return response.status(200).json({
      message: "Group deleted successfully",
      body: "",
      error: false,
    });
  } catch (error) {
    response.status(500).json({ error: "Erro ao excluir grupo" });
  }
});

router.post("/add-user", async (request: Request, response: Response) => {
  const { userIds, groupId } = request.body;

  try {
    const updateUserPromises = userIds.map((userId: string) =>
      prisma.user.update({
        where: { id: userId },
        data: { groupId: groupId },
      })
    );

    const updatedUsers = await prisma.$transaction(updateUserPromises);

    return response.status(201).json({
      message: "Members added to group successfully",
      body: updatedUsers,
      error: false,
    });
  } catch (err: any) {
    console.error("Error adding users to group: ", err);

    // Retornar uma resposta de erro genérica
    return response.status(500).json({
      message: "An error occurred while adding members to the group.",
      error: true,
    });
  } finally {
    await prisma.$disconnect();
  }
});

router.patch(
  "/:userId/remove-from-group",
  async (request: Request, response: Response) => {
    const { userId } = request.params;

    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          groupId: 0,
        },
      });

      return response.status(201).json({
        message: "Deleted member of group successfully",
        body: updatedUser,
        error: false,
      });
    } catch (err: any) {
      return response.status(500).json(err);
    }
  }
);

export default router;
