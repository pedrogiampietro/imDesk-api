import express, { Request, Response } from "express";
import { OpenAI } from "openai";

const openai = new OpenAI();

const router = express.Router();

router.post("/suporte", async (request: Request, response: Response) => {
  try {
    const { pergunta } = request.body;

    if (pergunta.trim().length === 0) {
      return response.status(400).json({
        error: {
          message: "Please enter a valid animal",
        },
      });
    }

    const result = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Você é um assistente de suporte de TI." },
        { role: "user", content: pergunta },
      ],
    });

    const data = result.choices[0];
    return response.status(200).json({
      message: "Response created successfully",
      body: data,
      error: false,
    });
  } catch (error) {
    console.log(error);
    response.status(500).send("Erro ao processar a solicitação");
  }
});

export default router;
