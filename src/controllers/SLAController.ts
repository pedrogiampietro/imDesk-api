import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { ticketPriority, resolutionTime } = request.body;

  try {
    const newSLA = await prisma.sLADefinition.create({
      data: {
        ticketPriority,
        resolutionTime,
      },
    });

    return response.status(200).json({
      message: "SLA created successfully",
      body: newSLA,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  try {
    const slas = await prisma.sLADefinition.findMany();

    return response.status(200).json({
      message: "SLAs retrieved successfully",
      body: slas,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.put("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;
  const data = request.body;

  try {
    const updatedSLA = await prisma.sLADefinition.update({
      where: { id: Number(id) },
      data,
    });

    return response.status(200).json({
      message: "SLA updated successfully",
      body: updatedSLA,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.delete("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    await prisma.sLADefinition.delete({
      where: { id: Number(id) },
    });

    return response.status(204).send();
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
