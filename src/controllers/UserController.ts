import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { uploadAvatars, uploadSignatures } from "../middlewares/multer";

import fs from "fs";
import path from "path";

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

router.get("/user", async (request, response) => {
  const { id } = request.query;

  try {
    const getAllUsers = await prisma.user.findUnique({
      where: {
        id: String(id),
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

router.put(
  "/user/update-avatar",
  uploadAvatars.single("avatar"),
  async (request: Request, response: Response) => {
    const userId = request.query.userId as string;

    if (!request.file) {
      return response.status(400).json({
        message: "File upload is required.",
        error: true,
      });
    }

    const avatarUrl = `http://${request.headers.host}/uploads/avatars/${request.file.filename}`;

    if (!userId) {
      return response.status(400).json({
        message: "User ID is required.",
        error: true,
      });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      if (existingUser?.avatarUrl) {
        const oldAvatarFilename = path.basename(existingUser.avatarUrl);
        const oldAvatarPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "avatars",
          oldAvatarFilename
        );

        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: avatarUrl },
      });

      return response.status(200).json({
        message: "Avatar updated successfully",
        updatedUser,
      });
    } catch (err) {
      return response.status(500).json(err);
    }
  }
);

router.patch("/update-user/:id", async (request, response) => {
  const userId = request.params.id;

  const {
    username,
    name,
    email,
    phone,
    ramal,
    sector,
    isTechnician,
    companyIds,
    hourlyRate,
  } = request.body;

  if (!email || !companyIds) {
    return response
      .status(400)
      .json("E-mail e Empresas são obrigatórios para atualização");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
    });

    if (!user) {
      return response.status(404).json("Usuário não encontrado");
    }

    const updateUser = await prisma.user.update({
      where: { id: String(userId) },
      data: {
        username,
        name,
        email,
        phone,
        ramal,
        sector,
        isTechnician,
        hourlyRate,
        UserCompanies: {
          deleteMany: {},
          create: companyIds.map((companyId: any) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "User updated successfully",
      body: updateUser,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.put("/user/update-password", async (request, response) => {
  const { userId, newPassword } = request.body;

  if (!userId || !newPassword) {
    return response.status(400).json({
      message: "User ID and new password are required.",
      error: true,
    });
  }

  // Hash the new password before saving to the database.
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return response.status(200).json({
      message: "Password updated successfully",
      updatedUser,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.put(
  "/user/update-signature",
  uploadSignatures.single("signature"),
  async (request: Request, response: Response) => {
    const userId = request.query.userId as string;

    if (!request.file) {
      return response.status(400).json({
        message: "File upload is required.",
        error: true,
      });
    }

    const signatureUrl = `http://${request.headers.host}/uploads/signatures/${request.file.filename}`;

    if (!userId) {
      return response.status(400).json({
        message: "User ID is required.",
        error: true,
      });
    }

    try {
      // Pega o signatureUrl antigo
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { signatureUrl: true },
      });

      // Se houver uma assinatura anterior, deleta o arquivo
      if (existingUser?.signatureUrl) {
        const oldSignatureFilename = path.basename(existingUser.signatureUrl);
        const oldSignaturePath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "signatures",
          oldSignatureFilename
        );

        // Se o arquivo existir no sistema de arquivos, deleta
        if (fs.existsSync(oldSignaturePath)) {
          fs.unlinkSync(oldSignaturePath);
        }
      }

      // Atualiza o signatureUrl no banco de dados
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { signatureUrl: signatureUrl },
      });

      return response.status(200).json({
        message: "Signature updated successfully",
        updatedUser,
      });
    } catch (err) {
      return response.status(500).json(err);
    }
  }
);

router.get("/user/get-signature", async (request, response) => {
  const userId = request.query.userId;

  if (!userId) {
    return response.status(400).json({
      message: "User ID is required.",
      error: true,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: { signatureUrl: true },
    });

    if (!user) {
      return response.status(404).json({
        message: "User not found.",
        error: true,
      });
    }

    return response.status(200).json({
      message: "Signature retrieved successfully.",
      body: user.signatureUrl,
      error: false,
    });
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
});

router.get("/users/online", async (request, response) => {
  try {
    const onlineUsers = await prisma.user.findMany({
      where: {
        isOnline: true,
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });
    return response.status(200).json({
      message: "Signature retrieved successfully.",
      body: onlineUsers,
      error: false,
    });
  } catch (err: any) {
    return response
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
});

export default router;
