import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (request: Request, response: Response) => {
  const { ticketId } = request.query;

  if (!ticketId || typeof ticketId !== "string") {
    return response.status(400).json({
      message: "CompanyId é obrigatório para buscar depósitos",
      error: true,
    });
  }

  try {
    const todos = await prisma.todo.findMany({
      where: {
        ticketId,
      },
    });

    return response.status(200).json({
      message: "Todos receive successfully",
      body: todos,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.post("/", async (request: Request, response: Response) => {
  try {
    const { description, ticketId } = request.body;
    const todo = await prisma.todo.create({
      data: {
        description,
        ticketId,
      },
    });

    return response.status(200).json({
      message: "Todo created successfully",
      body: todo,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.put("/:id", async (request: Request, response: Response) => {
  try {
    const id = request.path;
    const { completed } = request.body;
    const serealizedId = id.replace("/", "");

    const todoo = await prisma.todo.update({
      where: { id: serealizedId },
      data: {
        completed,
      },
    });

    return response.status(200).json({
      message: "Todo updated successfully",
      body: todoo,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.delete("/:id", async (request: Request, response: Response) => {
  try {
    const id = request.path;
    const serealizedId = id.replace("/", "");

    const todoo = await prisma.todo.delete({ where: { id: serealizedId } });

    return response.status(200).json({
      message: "Todo deleted successfully",
      body: todoo,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
