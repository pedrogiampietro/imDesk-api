// processQueue.js
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../lib/nodemailer";
import { generateEmailHtml } from "../lib/generateEmailHtml";

const prisma = new PrismaClient();

export const processEmailQueue = async () => {
  const unsentEmails = await prisma.emailQueue.findMany({
    where: {
      sent: false,
    },
  });

  for (const email of unsentEmails) {
    try {
      await sendEmail(
        email.to,
        email.subject,
        email.text,
        generateEmailHtml(email.text, email.subject, email.to)
      );

      await prisma.emailQueue.update({
        where: {
          id: email.id,
        },
        data: {
          sent: true,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }
};
