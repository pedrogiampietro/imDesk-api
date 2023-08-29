import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  logTicketCreation(userid: string) {
    console.log(`Usuário ${userid} abriu um ticket`);
    // Aqui você pode adicionar código para salvar o log em um arquivo, banco de dados, etc.
  },

  async logInventoryCreate(
    userid: string,
    name: string,
    quantity: number,
    deposit: string
  ) {
    try {
      await prisma.log.create({
        data: {
          userId: userid,
          action: "Adicionou um item",
          details: `Adicionou um ${name} ao deposito ${deposit} com a quantidade ${quantity}.`,
        },
      });
    } catch (err) {
      throw new Error("Erro ao salvar o log no banco de dados");
    }
  },

  async logInventoryUpdate(
    userid: string,
    name: string,
    quantityOld: number,
    quantityNew: number
  ) {
    try {
      await prisma.log.create({
        data: {
          userId: userid,
          action: "Atualizou Inventário",
          details: `Atualizou o inventário do item ${name} da quantidade ${quantityOld} items para ${quantityNew}`,
        },
      });
    } catch (err) {
      throw new Error("Erro ao salvar o log no banco de dados");
    }
  },

  logTicketAssignment(userid: string, ticketId: string) {
    console.log(`Usuário ${userid} atribuiu um ticket ${ticketId}`);
    // Aqui você pode adicionar código para salvar o log em um arquivo, banco de dados, etc.
  },
};
