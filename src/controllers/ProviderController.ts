import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { providerId, file, startDate, endDate } = request.body;

  try {
    const createContract = await prisma.contract.create({
      data: {
        providerId: providerId,
        file: file,
        startDate: startDate,
        endDate: endDate,
      },
    });

    return response.status(200).json({
      message: "Contract created successfully",
      body: createContract,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  try {
    const getAllContracts = await prisma.contract.findMany();

    return response.status(200).json({
      message: "Contracts found",
      body: getAllContracts,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
