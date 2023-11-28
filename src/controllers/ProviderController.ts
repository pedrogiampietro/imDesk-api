import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadStorageProviders } from "../middlewares/multer";

import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const router = express.Router();

// Criar um novo provedor
router.post("/provider", async (request: Request, response: Response) => {
  const { name, phone, email, address } = request.body;

  try {
    const provider = await prisma.provider.create({
      data: {
        name: name,
        phone: phone,
        email: email,
        address: address,
      },
    });

    return response.status(200).json({
      message: "Provider created successfully",
      body: provider,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/provider", async (request: Request, response: Response) => {
  try {
    const getAllProviders = await prisma.provider.findMany({
      include: {
        Contract: true,
        Service: true,
      },
    });

    return response.status(200).json({
      message: "Providers found",
      providers: getAllProviders,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

// Endpoint para atualizar um provider específico
router.put(
  "/provider/:id",
  uploadStorageProviders.single("logo"),
  async (request, response) => {
    const providerId = request.params.id;

    if (!request.file) {
      return response.status(400).json({
        message: "File upload is required.",
        error: true,
      });
    }

    const logoURL = `http://${request.headers.host}/uploads/providers_logo/${request.file.filename}`;

    try {
      const existingProvider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { logoURL: true },
      });

      if (existingProvider?.logoURL) {
        const oldLogoFilename = path.basename(existingProvider.logoURL);
        const oldLogoPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "providers_logo",
          oldLogoFilename
        );

        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      const updatedProvider = await prisma.provider.update({
        where: { id: providerId },
        data: { logoURL: logoURL },
      });

      return response.status(200).json({
        message: "Provider logo updated successfully",
        updatedProvider,
      });
    } catch (err) {
      console.error(err);
      return response.status(500).json(err);
    }
  }
);

// Deletar um provedor específico
router.delete("/provider/:id", async (request: Request, response: Response) => {
  const providerId = request.params.id;

  try {
    await prisma.provider.delete({
      where: {
        id: providerId,
      },
    });

    return response.status(200).json({
      message: "Provider deleted successfully",
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

// Adicionar um novo serviço a um provedor específico
router.post("/service", async (request: Request, response: Response) => {
  const { providerId, name, price, companyId } = request.body;

  try {
    const service = await prisma.service.create({
      data: {
        providerId: providerId,
        name: name,
        price: price,
        companyId: companyId,
      },
    });

    return response.status(200).json({
      message: "Service added successfully",
      body: service,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/service", async (request: Request, response: Response) => {
  try {
    const getAllService = await prisma.service.findMany({
      include: {
        Company: true,
      },
    });

    return response.status(200).json({
      message: "Service found",
      body: getAllService,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

// Adicionar um novo contrato a um provedor específico
router.post("/contract", async (request: Request, response: Response) => {
  const { providerId, file, startDate, endDate, companyId } = request.body;

  try {
    const contract = await prisma.contract.create({
      data: {
        providerId: providerId,
        file: file,
        startDate: startDate,
        endDate: endDate,
        companyId: companyId,
      },
    });

    return response.status(200).json({
      message: "Contract added successfully",
      body: contract,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/contract", async (request: Request, response: Response) => {
  try {
    const getAllContracts = await prisma.contract.findMany({
      include: {
        Company: true,
      },
    });

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
