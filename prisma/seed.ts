import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
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

  // Tipos de equipamentos
  const equipmentTypes = [
    "COMPUTADORES",
    "IMPRESSORAS",
    "AGITADOR DE PLAQUETAS",
    "ARCO C - CANHÃO",
    "AGITADOR DE PLAQUETAS",
    "ARCO C - CANHÃO",
    "ARCO C - TORRE",
    "ASPIRADOR PORTATIL",
    "AUTOCLAVE",
    "Balança de mesa",
    "BALANÇA DE PACIENTE",
    "Balança Plataforma",
    "BANHO MARIA",
    "BATEDEIRA BIVOLT - 900W",
    "BISTURI ELÉTRICO",
    "BOMBA DE CONTRASTE",
    "BOMBA DE SERINGA",
    "BOMBA INFUSORA",
    "CAMA HOSPITALAR ELÉTRICA",
    "CÂMARA FRIGORIFICA",
    "CARREGADOR DE BATERIA",
    "CARRO DE ANESTÉSIA",
    "Carro de mesa",
    "Carro de plataforma de carga",
    "CARRO DE VÍDEO - LIGHTING",
    "CARRO DE VÍDEO - PNEUMO SURE",
    "CARRO DE VÍDEO - TELA",
    "CARRO DE VÍDEO - VÍDEO CAMERA",
    "Carro Plataforma de carga",
    "Carro térmico",
    "CENTRÍFUGA",
    "CHAPA INDUSTRIAL",
    "Cortador de legumes manual",
    "CORTE DE FRIOS",
    "DESCASCADOR DE LEGUMES - BIVOLT",
    "DESCONGELADOR DE PLASMA",
    "DESFRIBILADOR",
    "DIGITALIZADOR",
    "ELETROCARDIOGRAMA",
    "ENCERADEIRA",
    "ENDOSCÓPIO",
    "ENDOSCÓPIO - CAMERA",
    "EXAUSTORES, Carro de mesa",
    "Extrator de suco industrial",
    "Extrator de sucos",
    "Fatiador de frios",
    "FOCO CIRÚRGICO",
    "FOCO PORTÁTIL",
    "FOGÃO 6 BOCAS",
    "FOGÃO INDUSTRIAL",
    "FONTE DE LUZ ENDOSCOPIA",
    "Forno de 6 bocas",
    "FREEZER DE ARMAZENAMENTO DE PLASMA",
    "GELADEIRA DE ARMAZENAMENTO DE AMOSTRA",
    "GELADEIRA DE ARMAZENAMENTO DE SANGUE",
    "GELADEIRAS E FREEZER",
    "LAVA LOUÇA",
    "LOCALIZADOR DE NERVOS",
    "MÁQUINA DE CAFÉ",
    "MARCO PASSO",
    "MESA CIRÚRGICA",
    "MICROSCÓPIO",
    "MÓDULO DE BATÉRIA",
    "MODULO IBPP",
    "MONITOR DE NIVEL DE CONCIÊNCIA",
    "MONITOR DE SERINGA CONTRASTE",
    "MONITOR DE SINAL VITAL",
    "MONITOR TOMÓGRAFO",
    "MULTIPROCESSADOR DE ALIMENTOS - BIVOLT",
    "OTOSCÓPIO",
    "OUTROS - DETALHAR EM CAMPO OBS",
    "OXÍMETRO PORTÁTIL",
    "PERFURADOR ÓSSEO",
    "PERNEIRA ORTOPÉDICA LD",
    "PERNEIRA ORTOPÉDICA LE",
    "PICADOR DE CARNE",
    "RAIO X",
    "RAIO X PORTÁTIL",
    "RAMPA FRIA",
    "RAMPA QUENTE",
    "RAMPA QUENTE DIETA",
    "REFRESQUEIRA DE SUCO",
    "SECADORA",
    "SELADORA",
    "SERRA DE GESSO",
    "SERRA ORTOPÉDICA",
    "TERMO-HIGRÔMETRO",
    "THERMOLAVADORA",
    "TOMÓGRAFO",
    "ULTRASSOM",
    "VENTILADOR",
    "VENTILADOR MECÂNICO",
    "VENTILADOR PEDIÁTRICO",
    "VENTILADOR PORTÁTIL",
    "WORKSTATION - TC",
  ];

  for (const type of equipmentTypes) {
    // Primeiro, verifique se o tipo de equipamento já existe
    const existingType = await prisma.equipmentType.findFirst({
      where: {
        name: type,
      },
    });

    // Se não existir, crie um novo
    if (!existingType) {
      await prisma.equipmentType.create({
        data: {
          name: type,
        },
      });
      console.log(`Tipo de equipamento criado: ${type}`);
    } else {
      console.log(`Tipo de equipamento '${type}' já existe, pulando...`);
    }
  }

  console.log(`${equipmentTypes.length} tipos de equipamentos criados.`);

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

  const existingUser = await prisma.user.findUnique({
    where: {
      username: userData.username,
    },
  });

  if (existingUser) {
    console.log(`Username '${userData.username}' is already taken.`);
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
    console.log("New user created:", newUser);
  } catch (error: any) {
    if (error.code === "P2002" && error.meta.target.includes("username")) {
      console.error(`Username '${userData.username}' is already taken.`);
    } else {
      console.error("An error occurred while creating a user:", error);
    }
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
