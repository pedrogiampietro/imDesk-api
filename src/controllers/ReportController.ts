import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/report", async (request: Request, response: Response) => {
  try {
    const { companyId } = request.query;

    if (!companyId || typeof companyId !== "string") {
      return response.status(400).json({
        message: "Company ID is required and must be a string.",
        error: true,
      });
    }

    const getAllTickets = await prisma.ticket.findMany({
      where: {
        TicketCompanies: {
          some: {
            companyId: companyId,
          },
        },
      },
      include: {
        User: true,
        assignedToAt: true,
        closedAt: true,
      },
    });

    const report = getAllTickets.map((ticket) => {
      const timeToClose = ticket.closedAt
        ? new Date(ticket.closedAt).getTime() -
          new Date(ticket.assignedToAt).getTime()
        : null;
      const hoursToClose = timeToClose ? timeToClose / (1000 * 60 * 60) : null;
      const cost = hoursToClose ? hoursToClose * ticket.User.hourlyRate : null;

      return {
        ticketId: ticket.id,
        technician: ticket.User.name,
        hoursToClose,
        cost,
      };
    });

    return response.status(200).json({
      message: "Report generated successfully",
      body: report,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
