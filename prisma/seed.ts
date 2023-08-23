import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // SLAs de exemplo
  const slaData = [
    {
      ticketType: "Preventiva",
      ticketCategory: "Software",
      ticketPriority: "Alta",
      resolutionTime: 2, // em horas
    },
    {
      ticketType: "Preventiva",
      ticketCategory: "Hardware",
      ticketPriority: "Média",
      resolutionTime: 4, // em horas
    },
    {
      ticketType: "Corretiva",
      ticketCategory: "Rede",
      ticketPriority: "Baixa",
      resolutionTime: 24, // em horas
    },
    // ... implementar o restante das SLAs conforme necessário
  ];

  for (const sla of slaData) {
    await prisma.sLADefinition.create({
      data: sla,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
