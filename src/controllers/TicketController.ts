import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

interface IRequestBody {
  description: string;
  ticketType: string;
  ticketCategory: string;
  ticketPriority: string;
  ticketLocation: string;
}

interface IRequestQuery {
  userId: string;
}

router.post('/', async (request: Request, response: Response) => {
  const {
    description,
    ticketType,
    ticketCategory,
    ticketPriority,
    ticketLocation,
  } = request.body as IRequestBody;
  const { userId } = request.query as unknown as IRequestQuery;

  try {
    const createTicket = await prisma.ticket.create({
      data: {
        description,
        createdBy: userId,
        ticketType,
        ticketCategory,
        ticketLocation,
        ticketPriority,
        status: 'new',
        assignedTo: [],
        equipaments: [],
        images: [],
        userId,
      },
    });

    return response.status(200).json({
      message: 'Ticket created successfully',
      body: createTicket,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
