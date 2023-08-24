import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  try {
    const info = request.body;

    // Verificações básicas para garantir que os dados corretos foram enviados
    if (
      !info.hostname ||
      !info.platform ||
      !info.release ||
      !info.cpu ||
      typeof info.memoryTotal !== "number" || // Verificar se é um número, depois converta para BigInt
      typeof info.memoryFree !== "number" ||
      !info.UserInfo ||
      !info.macAddress
    ) {
      return response.status(400).json({
        message: "Dados inválidos enviados",
        error: true,
      });
    }

    // Converta number para BigInt antes de salvá-los no banco de dados
    info.memoryTotal = String(info.memoryTotal);
    info.memoryFree = String(info.memoryFree);

    // Salvando as informações no banco de dados usando Prisma
    const machineInfo = await prisma.machineInfo.create({
      data: {
        hostname: info.hostname,
        platform: info.platform,
        release: info.release,
        cpu: info.cpu,
        memoryTotal: info.memoryTotal,
        memoryFree: info.memoryFree,
        userInfo: info.UserInfo,
        macAddress: info.macAddress,
        ipAddress: info.ipv4Address,
        Disks: {
          create: (info.Disks || []).map((disk: any) => ({
            device: disk.Device,
            size: BigInt(disk.Size),
            used: BigInt(disk.Used),
            available: BigInt(disk.Available),
            capacity: disk.Capacity,
          })),
        },
        InstalledApps: {
          create: (info.installedApps || []).map((app: any) => ({
            displayName: app.DisplayName,
            displayIcon: app.DisplayIcon,
            displayVersion: app.DisplayVersion || null,
            installLocation: app.InstallLocation || null,
            publisher: app.Publisher || null,
            uninstallString: app.UninstallString || null,
            otherDetails: {
              ...app, // adicione outros detalhes aqui
            },
          })),
        },
      },
    });

    response.status(201).json({
      message: "Data saved successfully",
      body: machineInfo,
      error: false,
    });
  } catch (error: any) {
    if (
      error.message &&
      error.message.includes("Unable to fit integer value")
    ) {
      console.error("O valor é muito grande para ser inserido!");
      response.status(500).json({
        message: "O valor é muito grande para ser inserido!",
        error: true,
      });
    } else {
      console.error("Erro desconhecido:", error.message);
      response.status(500).json({
        message: "Erro desconhecido",
        error: true,
      });
    }
  }
});

export default router;
