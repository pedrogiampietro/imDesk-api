import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { name, childrenName, defaultText, companyIds } = request.body;

  if (!companyIds || companyIds.length === 0) {
    return response
      .status(400)
      .json({ message: "At least one Company ID is required.", error: true });
  }

  try {
    const createTicketCategory = await prisma.ticketCategory.create({
      data: {
        name: name,
        childrenName: childrenName,
        defaultText: defaultText,
        TicketCategoryCompanies: {
          create: companyIds.map((companyId: string) => ({
            companyId: companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Ticket category created successfully",
      body: createTicketCategory,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  const { companyId } = request.query;

  if (!companyId || typeof companyId !== "string") {
    return response.status(400).json({
      message: "Company ID is required and must be a string.",
      error: true,
    });
  }

  try {
    const getAllTicketCategory = await prisma.ticketCategory.findMany({
      where: {
        TicketCategoryCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      include: {
        TicketCategoryCompanies: {
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

    const addedResponse = (processedData: any, label: any) =>
      processedData.filter((d: any) => d.label === label);

    const processBankResponse = (data: any) => {
      const processedData = [];
      for (let d of data) {
        const temp = addedResponse(processedData, d.name);
        if (!!temp.length) {
          temp[0].options.push({
            id: d.id,
            label: d.name,
            value: d.childrenName,
            defaultText: d.defaultText,
            company: d.TicketCategoryCompanies[0].company,
          });
        } else {
          processedData.push({
            label: d.name,
            options: [
              {
                id: d.id,
                label: d.name,
                value: d.childrenName,
                defaultText: d.defaultText,
                company: d.TicketCategoryCompanies[0].company,
              },
            ],
          });
        }
      }
      return processedData;
    };

    return response.status(200).json({
      message: "Ticket category found",
      body: processBankResponse(getAllTicketCategory),
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/find-by-id", async (request: Request, response: Response) => {
  const { id } = request.query;

  try {
    const getCategory = await prisma.ticketCategory.findUnique({
      where: {
        id: String(id),
      },
    });

    return response.status(200).json({
      message: "Category found",
      body: getCategory,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.patch("/update-category/:id", async (request, response) => {
  const categoryId = request.params.id;

  const { name, childrenName, defaultText, companyIds } = request.body;

  if (!categoryId || !companyIds) {
    return response
      .status(400)
      .json("ID e Empresas são obrigatórios para atualização");
  }

  try {
    const priority = await prisma.ticketCategory.findUnique({
      where: { id: String(categoryId) },
    });

    if (!priority) {
      return response.status(404).json("Usuário não encontrado");
    }

    const updateCategory = await prisma.ticketCategory.update({
      where: { id: String(categoryId) },
      data: {
        name,
        childrenName,
        defaultText,
        TicketCategoryCompanies: {
          deleteMany: {},
          create: companyIds.map((companyId: any) => ({
            companyId,
          })),
        },
      },
    });

    return response.status(200).json({
      message: "Category updated successfully",
      body: updateCategory,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
