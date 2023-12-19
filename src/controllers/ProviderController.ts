import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadProviders, uploadContracts } from "../middlewares/multer";

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
  uploadProviders.any(),
  async (request, response) => {
    const providerId = request.params.id;

    const {
      name,
      phone,
      email,
      address,
      description,
      category,
      price,
      status,
      contracts,
      services,
      serviceProvided,
      monthlyValue,
      dueDate,
      operationDate,
      contractNumber,
      adendum,
    } = request.body;

    let logoURL;

    if (request.file) {
      logoURL = `http://${request.headers.host}/uploads/providers_logo/${request.file.filename}`;
    }

    try {
      const existingProvider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
          Contract: true,
          Service: true,
        },
      });

      if (!existingProvider) {
        return response.status(404).json({
          message: "Provider not found",
          error: true,
        });
      }

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
        data: {
          name: name,
          phone: phone || undefined,
          email: email,
          address: address,
          description: description !== "null" ? description : undefined,
          category: category !== "null" ? category : undefined,
          price: !isNaN(parseFloat(price)) ? parseFloat(price) : undefined,
          status: status || undefined,
          logoURL: logoURL || undefined,
          serviceProvided: serviceProvided || undefined,
          monthlyValue: !isNaN(parseFloat(monthlyValue))
            ? parseFloat(monthlyValue)
            : undefined,
          dueDate: new Date(dueDate),
          operationDate: new Date(operationDate),
          contractNumber: contractNumber || undefined,
          adendum: adendum || undefined,
          Contract: {
            connectOrCreate: contracts?.map((contract: any) => ({
              where: { id: contract.id },
              create: contract,
            })),
          },
          Service: {
            connectOrCreate: services?.map((service: any) => ({
              where: { id: service.id },
              create: service,
            })),
          },
        },
      });

      return response.status(200).json({
        message: "Provider logo updated successfully",
        body: updatedProvider,
        error: false,
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

router.put("/contract/:providerId", uploadContracts.any(), async (req, res) => {
  const { providerId } = req.params;
  const { dueDate, companyId } = req.body;

  if (req.files && Array.isArray(req.files)) {
    const pdfFiles = req.files.filter(
      (file) => file.mimetype === "application/pdf"
    );
    const logoFile = req.files.find((file) =>
      file.mimetype.startsWith("image/")
    );

    const pdfURLs = pdfFiles.map(
      (file) => `http://${req.headers.host}/uploads/pdf_files/${file.filename}`
    );

    try {
      const newContracts = await Promise.all(
        pdfURLs.map((pdfURL: any) =>
          prisma.contract.create({
            data: {
              provider: {
                connect: { id: providerId },
              },
              Company: {
                connect: { id: companyId },
              },
              file: pdfURL,
              startDate: new Date(),
              endDate: new Date(dueDate),
            },
          })
        )
      );

      if (logoFile) {
        const logoURL = `http://${req.headers.host}/uploads/logo_files/${logoFile.filename}`;
        // Update the provider with the new logo URL
        const updatedProvider = await prisma.provider.update({
          where: { id: providerId },
          data: { logoURL },
        });
      }

      return res.status(200).json({
        message: "PDFs uploaded and contracts created successfully",
        contracts: newContracts,
        error: false,
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: true, message: err.message });
    }
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
