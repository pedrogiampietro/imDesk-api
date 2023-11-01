import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/dashboard", async (request: Request, response: Response) => {
  try {
    const { userId } = request.body;

    const statusCounts = await prisma.ticket.groupBy({
      where: { userId },
      by: ["status"],
      _count: true,
    });

    const lateTicketsCount = await prisma.ticket.count({
      where: {
        userId,
        timeEstimate: {
          lt: new Date(),
        },
      },
    });

    const newTicketsCount =
      statusCounts.find((item) => item.status === "new")?._count || 0;
    const assignedTicketsCount =
      statusCounts.find((item) => item.status === "assigned")?._count || 0;

    const categoryCounts = await prisma.ticket.groupBy({
      where: { userId },
      by: ["ticketCategoryId"],
      _count: true,
    });

    const priorityCounts = await prisma.ticket.groupBy({
      where: { userId },
      by: ["ticketPriorityId"],
      _count: true,
    });

    const recentTickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const allTickets = await prisma.ticket.count({
      where: { userId },
    });

    const ticketsToday = await prisma.ticket.count({
      where: {
        userId,
        timeEstimate: {
          equals: new Date(),
        },
      },
    });

    const ticketsTomorrow = await prisma.ticket.count({
      where: {
        userId,
        timeEstimate: {
          equals: new Date(new Date().setDate(new Date().getDate() + 1)),
        },
      },
    });

    const ticketsAfter = await prisma.ticket.count({
      where: {
        userId,
        timeEstimate: {
          gte: new Date(new Date().setDate(new Date().getDate() + 2)),
        },
      },
    });

    return response.status(200).json({
      message: "Dashboard data retrieved successfully",
      error: false,
      newTicketsCount,
      lateTicketsCount,
      assignedTicketsCount,
      statusCounts,
      categoryCounts,
      priorityCounts,
      recentTickets,
      dueDateService: {
        all: allTickets,
        today: ticketsToday,
        tomorrow: ticketsTomorrow,
        after: ticketsAfter,
      },
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.post("/os", async (request: Request, response: Response) => {
  try {
    const { userId, startDate, endDate } = request.body;

    console.log(
      `UserId: ${userId}, StartDate: ${startDate}, EndDate: ${endDate}`
    );

    const timezoneOffset = new Date().getTimezoneOffset() * 60000;

    // Adjust startDate to start of the day and endDate to end of the day
    const adjustedStartDate = new Date(
      new Date(startDate).getTime() - timezoneOffset
    );
    adjustedStartDate.setHours(0, 0, 0, 0);

    const adjustedEndDate = new Date(
      new Date(endDate).getTime() - timezoneOffset
    );
    adjustedEndDate.setHours(23, 59, 59, 999);

    console.log(
      `Adjusted StartDate: ${adjustedStartDate.toISOString()}, Adjusted EndDate: ${adjustedEndDate.toISOString()}`
    );

    console.log(
      `Server Timezone Offset: ${new Date().getTimezoneOffset()} minutes`
    );

    // Fetch all tickets
    const allTickets = await prisma.ticket.findMany({
      select: {
        assignedTo: true,
        closedAt: true,
      },
    });

    // Extract UUIDs from assignedTo
    const assignedUUIDs = allTickets
      .map((ticket) => {
        return ticket.assignedTo.map((assigned) => assigned.split("-")[0]);
      })
      .flat();

    console.log("All UUIDs:", assignedUUIDs);

    // Contagem de OS abertas no período
    const openedOS = await prisma.ticket.count({
      where: {
        assignedTo: {
          hasSome: userId, // We continue to use 'some' as we're checking against a list
        },
        createdAt: {
          gte: adjustedStartDate,
          lte: adjustedEndDate,
        },
      },
    });

    // Contagem de OS fechadas no período
    const closedOS = await prisma.ticket.count({
      where: {
        assignedTo: {
          hasSome: userId, // We continue to use 'hasSome' as we're checking against a list
        },
        closedAt: {
          gte: adjustedStartDate,
          lte: adjustedEndDate,
        },
      },
    });

    console.log(`OpenedOS: ${openedOS}, ClosedOS: ${closedOS}`);

    return response.status(200).json({
      openedOS,
      closedOS,
      error: false,
    });
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    return response.status(500).json({ error: true, message: err.message });
  }
});

export default router;
