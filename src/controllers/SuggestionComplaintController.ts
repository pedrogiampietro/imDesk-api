import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (request: Request, response: Response) => {
  const { userId, company, description, category } = request.body;

  try {
    const newSuggestionComplaint = await prisma.suggestionComplaint.create({
      data: {
        userId,
        companyId: company.id,
        description,
        category: category.value,
        status: "new",
      },
    });

    return response.status(201).json({
      message: "Suggestion created successfully",
      body: newSuggestionComplaint,
      error: false,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json(err);
  }
});

router.get("/", async (request: Request, response: Response) => {
  const { companyId } = request.query;

  try {
    const suggestionsComplaints = await prisma.suggestionComplaint.findMany({
      where: {
        companyId: String(companyId),
      },
    });

    return response.status(200).json({
      message: "Suggestion created successfully",
      body: suggestionsComplaints,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

router.get("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    const suggestionComplaint = await prisma.suggestionComplaint.findUnique({
      where: { id },
    });

    if (suggestionComplaint) {
      return response.status(200).json({
        message: "Suggestion found successfully",
        body: suggestionComplaint,
        error: false,
      });
    } else {
      return response.status(404).json({
        message: "Suggestion not found",
        error: true,
      });
    }
  } catch (err) {
    console.error(err);
    return response.status(500).json({
      message: "Error retrieving suggestion",
      error: true,
    });
  }
});

router.patch("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;
  const { description, company, category, status, resolvedAt, feedback } =
    request.body;

  try {
    const updatedSuggestionComplaint = await prisma.suggestionComplaint.update({
      where: { id },
      data: {
        description,
        category: category.value,
        status: status.value,
        companyId: company.id,
        resolvedAt: new Date(resolvedAt),
        feedback,
      },
    });

    return response.status(200).json({
      message: "Suggestion created successfully",
      body: updatedSuggestionComplaint,
      error: false,
    });
  } catch (err) {
    console.log(err);
    return response.status(500).json(err);
  }
});

router.delete("/", async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    await prisma.suggestionComplaint.delete({
      where: { id },
    });

    return response.status(200).json({
      message: "Suggestion created successfully",
      body: null,
      error: false,
    });
  } catch (err) {
    return response.status(500).json(err);
  }
});

export default router;
