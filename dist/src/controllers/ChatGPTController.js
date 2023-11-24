"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("openai");
const openai = new openai_1.OpenAI();
const router = express_1.default.Router();
router.post("/suporte", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pergunta } = request.body;
        if (pergunta.trim().length === 0) {
            return response.status(400).json({
                error: {
                    message: "Please enter a valid animal",
                },
            });
        }
        const result = yield openai.chat.completions.create({
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
    }
    catch (error) {
        console.log(error);
        response.status(500).send("Erro ao processar a solicitação");
    }
}));
exports.default = router;
