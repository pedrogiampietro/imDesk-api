import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const subdomain = req.hostname.split(".")[0];

  try {
    const tenantId = await getTenantIdFromSubdomain(subdomain);

    if (tenantId) {
      req.tenantId = tenantId;
      next();
    } else {
      res.status(404).send("Tenant não encontrado");
    }
  } catch (error) {
    console.error("Erro ao buscar tenant:", error);
    res.status(500).send("Erro interno do servidor");
  }
};

async function getTenantIdFromSubdomain(subdomain: any) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: {
        subdomain: subdomain,
      },
    });

    return tenant ? tenant.id : null;
  } catch (error) {
    console.error("Erro ao buscar tenant:", error);
    throw new Error("Erro ao buscar tenant");
  }
}
