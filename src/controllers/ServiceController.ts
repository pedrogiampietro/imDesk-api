import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { providerId, name, price } = request.body;

  try {
    const createService = await prisma.service.create({
      data: {
        providerId: providerId,
        name: name,
        price: price,
      },
    });

    return response.status(200).json({
      message: "Service created successfully",
      body: createService,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  try {
    const getAllServices = await prisma.service.findMany();

    return response.status(200).json({
      message: "Services found",
      body: getAllServices,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
