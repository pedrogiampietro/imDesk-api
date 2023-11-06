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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmailQueue = void 0;
// processQueue.js
const client_1 = require("@prisma/client");
const nodemailer_1 = require("../lib/nodemailer");
const generateEmailHtml_1 = require("../lib/generateEmailHtml");
const prisma = new client_1.PrismaClient();
const processEmailQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    const unsentEmails = yield prisma.emailQueue.findMany({
        where: {
            sent: false,
        },
    });
    for (const email of unsentEmails) {
        try {
            yield (0, nodemailer_1.sendEmail)(email.to, email.subject, email.text, (0, generateEmailHtml_1.generateEmailHtml)(email.text, email.subject, email.to));
            yield prisma.emailQueue.update({
                where: {
                    id: email.id,
                },
                data: {
                    sent: true,
                    updatedAt: new Date(),
                },
            });
        }
        catch (error) {
            console.error("Failed to send email:", error);
        }
    }
});
exports.processEmailQueue = processEmailQueue;
