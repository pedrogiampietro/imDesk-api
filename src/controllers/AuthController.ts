import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

const prisma = new PrismaClient();
const router = express.Router();
const saltRounds = 10;

router.post("/sign-up", async (request, response) => {
  const {
    username,
    name,
    email,
    password,
    phone,
    ramal,
    sector,
    isTechnician,
    companyIds,
  } = request.body;

  if (!email || !password || !companyIds)
    response
      .status(400)
      .json("Nome, e-mail, senha e companyIds são obrigatórios para cadastro");

  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  try {
    const createUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        phone,
        ramal,
        sector,
        isTechnician,
        groupId: null,
        UserCompanies: {
          create: companyIds.map((companyId: string) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(201).json({
      message: "User created successfully",
      body: createUser,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.post("/sign-in", async (request: Request, response: Response) => {
  const { email, password, companyId, companyName } = request.body as any;

  try {
    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        UserCompanies: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!findUser) {
      return response.status(404).json("Usuário não encontrado no sistema.");
    }

    if (findUser.UserCompanies.length === 0) {
      return response
        .status(400)
        .json("Usuário não associado a nenhuma empresa.");
    }

    const validPassword = await bcrypt.compare(password, findUser.password);

    if (!validPassword) {
      return response.status(400).json("Password incorreto, tente novamente.");
    }

    // Update user's currentLoggedCompany
    await prisma.user.update({
      where: {
        id: findUser.id,
      },
      data: {
        currentLoggedCompanyId: companyId,
        currentLoggedCompanyName: companyName,
      },
    });

    const token = generateAccessToken(findUser.id);
    const refreshToken = generateRefreshToken(findUser.id, token);

    return response.status(200).json({
      id: findUser.id,
      name: findUser.name,
      email: findUser.email,
      avatarUrl: findUser.avatarUrl,
      isTechnician: findUser.isTechnician,
      companies: findUser.UserCompanies.map((uc: any) => ({
        companyId: uc.company.id,
        companyName: uc.company.name,
      })),
      currentLogged: {
        currentLoggedCompanyId: companyId,
        currentLoggedCompanyName: companyName,
      },
      tokens: {
        token: token,
        refreshToken: refreshToken,
      },
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
