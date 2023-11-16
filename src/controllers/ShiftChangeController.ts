import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const {
    controleTemperatura,
    companyId,
    responsibleUserId,
    atribuidos,
    planejados,
    pendentes,
  } = request.body;

  console.log("Dados recebidos:", {
    controleTemperatura,
    companyId,
    responsibleUserId,
    atribuidos,
    planejados,
    pendentes,
  });

  try {
    // Cria uma nova ShiftChange
    const shiftChange = await prisma.shiftChange.create({
      data: {
        date: new Date(),
        responsibleUserId,
        temperatureControl: controleTemperatura,
        ShiftChangeCompanies: {
          create: { companyId },
        },
      },
    });

    console.log("ShiftChange criada:", shiftChange);

    // Função para extrair IDs válidos dos tickets
    const extractValidTicketIds = (tickets: any[]) => {
      return tickets
        .filter((ticket) => ticket.id && ticket.id.trim() !== "")
        .map((ticket) => ticket.id);
    };

    // Extrai e associa os tickets à ShiftChange
    const allTicketIds = [
      ...extractValidTicketIds(atribuidos),
      ...extractValidTicketIds(planejados),
      ...extractValidTicketIds(pendentes),
    ];

    console.log("IDs dos tickets a serem associados:", allTicketIds);

    // Associa os tickets atribuídos à ShiftChange
    for (const ticket of atribuidos) {
      if (ticket.id && ticket.id.trim() !== "") {
        await prisma.shiftChangeAssignedTicket.create({
          data: {
            shiftChangeId: shiftChange.id,
            ticketId: ticket.id,
          },
        });
      }
    }

    // Associa os tickets planejados à ShiftChange
    for (const ticket of planejados) {
      if (ticket.id && ticket.id.trim() !== "") {
        await prisma.shiftChangePlannedTicket.create({
          data: {
            shiftChangeId: shiftChange.id,
            ticketId: ticket.id,
          },
        });
      }
    }

    // Associa os tickets pendentes à ShiftChange
    for (const ticket of pendentes) {
      if (ticket.id && ticket.id.trim() !== "") {
        await prisma.shiftChangePendingTicket.create({
          data: {
            shiftChangeId: shiftChange.id,
            ticketId: ticket.id,
          },
        });
      }
    }

    return response.status(200).json({
      message: "Shift Change created successfully",
      shiftChange: shiftChange,
    });
  } catch (err) {
    console.error("Error on creating Shift Change: ", err);
    return response
      .status(500)
      .json({ message: "Internal server error", error: true });
  }
});

router.get("/", async (request: Request, response: Response) => {
  try {
    const shiftChanges = await prisma.shiftChange.findMany({
      include: {
        ShiftChangeCompanies: true,
        ResponsibleUser: true,
        ShiftChangeAssignedTicket: {
          include: {
            Ticket: {
              select: {
                id: true,
                description: true,
              },
            },
          },
        },
        ShiftChangePendingTicket: {
          include: {
            Ticket: {
              select: {
                id: true,
                description: true,
              },
            },
          },
        },
        ShiftChangePlannedTicket: {
          include: {
            Ticket: {
              select: {
                id: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return response.status(200).json({
      message: "Shift Changes found",
      body: shiftChanges,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/:id", async (request: Request, response: Response) => {
  const id = request.params.id;

  try {
    const shiftChange = await prisma.shiftChange.findUnique({
      where: { id },
      include: {
        ShiftChangeCompanies: true,
        ResponsibleUser: true,
        ShiftChangeAssignedTicket: true,
        ShiftChangePendingTicket: true,
        ShiftChangePlannedTicket: true,
      },
    });

    return response.status(200).json({
      message: "Shift Changes found",
      body: shiftChange,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.put("/:id", async (request: Request, response: Response) => {
  const id = request.params.id;
  const { date, responsibleUserId, temperatureControl } = request.body;

  try {
    const shiftChange = await prisma.shiftChange.update({
      where: { id },
      data: {
        date,
        responsibleUserId,
        temperatureControl,
      },
    });

    return response.status(200).json({
      message: "Shift Change updated successfully",
      body: shiftChange,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.delete("/:id", async (request: Request, response: Response) => {
  const id = request.params.id;

  try {
    await prisma.shiftChange.delete({ where: { id } });

    return response.status(200).json({
      message: "Shift Changes deleted successfully",
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
