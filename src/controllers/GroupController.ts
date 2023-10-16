import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { name } = request.body;

  try {
    const newGroup = await prisma.group.create({
      data: {
        name,
      },
    });

    return response.status(201).json({
      message: "Group created successfully",
      body: newGroup,
      error: false,
    });
  } catch (err: any) {
    return response.status(500).json(err);
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
  const { userId, groupId } = request.body;

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        groupId: groupId,
      },
    });

    return response.status(201).json({
      message: "Added member to group successfully",
      body: updatedUser,
      error: false,
    });
  } catch (err: any) {
    return response.status(500).json(err);
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
