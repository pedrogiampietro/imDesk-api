import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/users", async (request, response) => {
  const companyId = request.query.companyId;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "Company ID is required and must be a string.",
      error: true,
    });
  }

  try {
    const getAllUsers = await prisma.user.findMany({
      where: {
        UserCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return response.status(200).json(getAllUsers);
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/technicians", async (request, response) => {
  const companyId = request.query.companyId;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "Company ID is required and must be a string.",
      error: true,
    });
  }

  try {
    const getAllTechnicians = await prisma.user.findMany({
      where: {
        isTechnician: true,
        UserCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isTechnician: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return response.status(200).json(getAllTechnicians);
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
