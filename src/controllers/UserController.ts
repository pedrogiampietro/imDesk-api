import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import upload from "../middlewares/multer";

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
  upload.single("avatar"),
  async (request, response) => {
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
      // Pega o avatarUrl antigo
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      // Se houver um avatar anterior, deleta o arquivo
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

        // Se o arquivo existir no sistema de arquivos, deleta
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Atualiza o avatarUrl no banco de dados
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

export default router;
