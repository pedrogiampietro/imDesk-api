import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10;

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

  let newCompanies = [];
  const companyData = [
    {
      name: "Empresa ABC",
      address: "Rua dos Alfeneiros, 123",
    },
    {
      name: "Empresa XYZ",
      address: "Avenida Exemplo, 456",
    },
  ];

  for (const company of companyData) {
    const newCompany = await prisma.company.create({
      data: company,
    });
    newCompanies.push(newCompany);
  }

  // Verificar se empresas foram criadas
  if (newCompanies.length === 0) {
    throw new Error(
      "Nenhuma empresa foi criada; não é possível prosseguir com a criação do usuário."
    );
  }

  // Preparando dados do usuário
  const userData = {
    username: "administrador",
    name: "Administrador",
    email: "administrador@example.com",
    password: "secret",
    phone: "11912345678",
    ramal: "3001",
    sector: "Tecnologia da Informação",
    isTechnician: true,
    groupId: null,
    UserCompanies: {
      create: {
        companyId: newCompanies[0].id,
      },
    },
  };

  // Criptografando a senha
  const hashedPassword = bcrypt.hashSync(userData.password, saltRounds);

  // Criando o usuário
  const newUser = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  console.log("Usuário criado:", newUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
