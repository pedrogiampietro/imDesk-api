import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // SLAs de exemplo
  const slaData = [
    {
      ticketPriority: "Alta",
      resolutionTime: 12, // em horas
    },
    {
      ticketPriority: "Média",
      resolutionTime: 24, // em horas
    },
    {
      ticketPriority: "Baixa",
      resolutionTime: 72, // em horas
    },
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
