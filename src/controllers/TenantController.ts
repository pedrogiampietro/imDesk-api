import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/get-tenant", async (request: Request, response: Response) => {
  let subdomain = request.hostname.split(".")[0];

  if (request.hostname === "localhost" || request.hostname === "imdesk.cloud") {
    const getTenant = await prisma.tenant.findUnique({
      where: {
        subdomain: "imdesk.cloud",
      },
    });

    (request as any).tenantId = getTenant?.id;
    subdomain = "imdesk.cloud";
  }

  try {
    const getTenant = await prisma.tenant.findUnique({
      where: {
        subdomain,
      },
    });

    if (!getTenant) {
      return response.status(400).json({
        message: "Tenant not exists",
        body: null,
        error: true,
      });
    }
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.post("/create-tenant", async (request: Request, response: Response) => {
  const { name, subdomain } = request.body;

  if (!name || !subdomain)
    return response.status(400).json("Nome e dominio são obrigatórios");

  //todo refafactor validation to use yup

  const findTenant = await prisma.tenant.findMany({
    where: {
      subdomain,
    },
  });

  if (findTenant.length > 0) {
    return response.status(409).json("Já existe um dominio com esse nome.");
  }

  try {
    const createUser = await prisma.tenant.create({
      data: {
        name,
        subdomain,
      },
    });

    return response.status(201).json({
      message: "Project created successfully",
      body: createUser,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
