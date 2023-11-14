import axios from "axios";

const discordWebhookUrl =
  "https://discord.com/api/webhooks/1174072323800846426/JmR3b3Uemc0gaNGZ1cfNkmU24ZqjuLxAG6OWpwDwPgwtRXIxdUojEO2yO02He8etYTEr";

export async function createTicketNotification(ticketInfo: any) {
  const mensagemDiscord = {
    embeds: [
      {
        title: "🎟️ Novo Chamado Aberto",
        color: 3447003,
        fields: [
          {
            name: "📝 Descrição",
            value: ticketInfo.description,
          },
          {
            name: "🔺 Prioridade",
            value: ticketInfo.ticketPriority.name,
          },
          {
            name: "📍 Localização",
            value: ticketInfo.ticketLocation.name,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Sistema de Chamados",
        },
      },
    ],
  };

  try {
    await axios.post(discordWebhookUrl, mensagemDiscord);
    console.log("Notificação enviada para o Discord");
  } catch (error) {
    console.error("Erro ao enviar notificação para o Discord:", error);
  }
}

export async function updateTicketNotification(ticketInfo: any) {
  const mensagemDiscord = {
    embeds: [
      {
        title: "🔄 Chamado Atualizado",
        color: 16776960, // Cor amarela
        fields: [
          {
            name: "📝 Descrição",
            value: ticketInfo.description,
          },
          {
            name: "🔺 Prioridade",
            value: ticketInfo.ticketPriority.name,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Sistema de Chamados",
        },
      },
    ],
  };

  try {
    await axios.post(discordWebhookUrl, mensagemDiscord);
    console.log("Notificação de atualização enviada para o Discord");
  } catch (error) {
    console.error(
      "Erro ao enviar notificação de atualização para o Discord:",
      error
    );
  }
}

export async function closeTicketNotification(ticketInfo: any) {
  const mensagemDiscord = {
    embeds: [
      {
        title: "✅ Chamado Fechado",
        color: 65280, // Cor verde
        fields: [
          {
            name: "📝 Descrição",
            value: ticketInfo.description,
          },
          {
            name: "🔺 Prioridade",
            value: ticketInfo.ticketPriority.name,
          },
          // ... outros campos relevantes
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Sistema de Chamados",
        },
      },
    ],
  };

  try {
    await axios.post(discordWebhookUrl, mensagemDiscord);
    console.log("Notificação de fechamento enviada para o Discord");
  } catch (error) {
    console.error(
      "Erro ao enviar notificação de fechamento para o Discord:",
      error
    );
  }
}
