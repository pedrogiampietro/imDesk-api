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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const puppeteer_1 = __importDefault(require("puppeteer"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
function formatarData(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
}
function calcularDiferencaTempo(dataInicial, dataFinal) {
    const date1 = new Date(dataInicial);
    const date2 = new Date(dataFinal);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        throw new Error("Data inválida fornecida");
    }
    const diffInMilliseconds = Math.abs(date2 - date1);
    const days = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    const hoursMilliseconds = diffInMilliseconds % (1000 * 60 * 60 * 24);
    const hours = Math.floor(hoursMilliseconds / (1000 * 60 * 60));
    const minutesMilliseconds = hoursMilliseconds % (1000 * 60 * 60);
    const minutes = Math.floor(minutesMilliseconds / (1000 * 60));
    const secondsMilliseconds = minutesMilliseconds % (1000 * 60);
    const seconds = Math.floor(secondsMilliseconds / 1000);
    return {
        days,
        hours,
        minutes,
        seconds,
    };
}
function buildHTML(ticketData) {
    var _a, _b, _c, _d, _e;
    const diff = calcularDiferencaTempo(ticketData.createdAt, ticketData.closedAt);
    let assignedTo = null;
    if (ticketData &&
        Array.isArray(ticketData.assignedTo) &&
        typeof ticketData.assignedTo[0] === "string") {
        const serealizedAssignedTo = ticketData.assignedTo[0].split("-");
        assignedTo = serealizedAssignedTo[serealizedAssignedTo.length - 1];
    }
    const html = `
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Detalhes do Chamado</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 20px;
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
          }
          .section {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              margin-bottom: 20px;
          }
          .column {
              flex: 1;
              margin-right: 20px;
          }
          .column:last-child {
              margin-right: 0;
          }
          label {
              font-weight: bold;
          }
          h2 {
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
          }
          img {
            width: 150px
            height: 150px;
          }
          .footer {
              margin-top: 20px;
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <img src="https://empbraatsstorage.blob.core.windows.net/atslogos/beb3dcd6-549d-44b7-a580-a3b8c922933b_4.png" alt="CEJAM Logo">
          <h2>${ticketData.User.currentLoggedCompanyName} - ${ticketData.User.sector}</h2>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Ordem de Serviço:</label>
              <p>#${ticketData.id.split("-")[0]}</p>
          </div>
          <div class="column">
              <label>Solicitante:</label>
              <p>${ticketData.User.name}</p>
          </div>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Setor solicitante:</label>
              <p>${ticketData.ticketLocation.name}</p>
          </div>
          <div class="column">
              <label>Data de abertura:</label>
              <p>${formatarData(ticketData.createdAt)}</p>
          </div>
          <div class="column">
              <label>Data de fechamento:</label>
              <p>${formatarData(ticketData.closedAt)}</p>
          </div>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Hora atribuido:</label>
              <p>${ticketData.assignedToAt}</p>
          </div>
          <div class="column">
              <label>Atribuido para:</label>
              <p>${assignedTo}</p>
          </div>
		  <div class="column">
			<label>Avaliação do solicitante:</label>
			<p>${(_a = ticketData.TicketEvaluation[0]) === null || _a === void 0 ? void 0 : _a.rating}</p>
		</div>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Número de patrimônio:</label>
              <p>${(_b = ticketData.equipmentUsage[0]) === null || _b === void 0 ? void 0 : _b.equipmentPatrimony}</p>
          </div>
          <div class="column">
              <label>Número de série:</label>
              <p>${(_c = ticketData.equipmentUsage[0]) === null || _c === void 0 ? void 0 : _c.equipmentSerial}</p></p>
          </div>
          <div class="column">
              <label>Nome do equipamento:</label>
              <p>${(_d = ticketData.equipmentUsage[0]) === null || _d === void 0 ? void 0 : _d.equipmentName}</p>
          </div>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Descrição do serviço solicitado:</label>
              <p>${ticketData.description}</p>
          </div>
      </div>
  
     <div class="section">
        <div class="column">
              <label>Observação do serviço executado:</label>
              <p>${ticketData === null || ticketData === void 0 ? void 0 : ticketData.observationServiceExecuted}</p>
        </div>
    </div>  


    <div class="section">
      <div class="column">
          <label>Assinatura do solicitante:</label>
          ${ticketData.User.signatureUrl && ticketData.ticketWasSignedUser
        ? `<div><img src="${ticketData.User.signatureUrl}" alt="Assinatura do Solicitante" /></div>`
        : `<p>Assinatura não disponível</p>`}
      </div>
      <div class="column">
          <label>Assinatura do executante</label>
          ${ticketData.techUserSignature && ticketData.ticketWasSignedTech
        ? `<div><img src="${ticketData.techUserSignature}" alt="Assinatura do Solicitante" /></div>`
        : `<p>Assinatura não disponível</p>`}
      </div>
    </div>
  
      <div class="section">
        <div class="column">
            <label>Valor do reparo (R$):</label>
            <p>R$ ${(_e = ticketData === null || ticketData === void 0 ? void 0 : ticketData.usedItems) === null || _e === void 0 ? void 0 : _e.reduce((total, item) => total + item.cost, 0)}</p>
        </div>
          <div class="column">
              <label>Motivo da OS:</label>
              <p>${ticketData.ticketType.name}</p>
          </div>
          <div class="column">
              <label>Tempo de execução da atividade:</label>
              <p>${diff.days} dias, ${diff.hours} horas, ${diff.minutes} minutos, ${diff.seconds} segundos</p>
          </div>
      </div>
  
  </body>
  </html>
    `;
    return html;
}
router.get("/:id", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const ticketId = request.path;
        const serealizedTicketId = ticketId.replace("/", "");
        const { currentUserId, companyId } = request.query;
        const userIdStr = String(currentUserId);
        if (!companyId || typeof companyId !== "string") {
            return response.status(400).json({
                message: "Company ID is required and must be a string.",
                error: true,
            });
        }
        const currentUserGroup = yield prisma.user.findUnique({
            where: {
                id: userIdStr,
            },
            select: {
                Groups: true,
            },
        });
        const baseCondition = {
            OR: [
                {
                    userId: userIdStr,
                },
                {
                    groupId: (_a = currentUserGroup === null || currentUserGroup === void 0 ? void 0 : currentUserGroup.Groups) === null || _a === void 0 ? void 0 : _a.id,
                },
            ],
        };
        const getAllTickets = yield prisma.ticket.findMany({
            where: Object.assign(Object.assign({}, baseCondition), { id: serealizedTicketId, TicketCompanies: {
                    some: {
                        companyId: companyId,
                    },
                } }),
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
            include: {
                ticketCategory: true,
                ticketLocation: true,
                ticketPriority: true,
                ticketType: true,
                User: true,
                TicketEvaluation: true,
                TicketCompanies: {
                    include: {
                        company: true,
                    },
                },
                images: true,
                usedItems: {
                    include: {
                        DepotItem: true,
                    },
                },
                Equipments: {
                    include: {
                        equipment: true,
                    },
                },
            },
        });
        let serealizedAssignedTo = (_c = (_b = getAllTickets[0]) === null || _b === void 0 ? void 0 : _b.assignedTo[0]) === null || _c === void 0 ? void 0 : _c.split("-");
        serealizedAssignedTo === null || serealizedAssignedTo === void 0 ? void 0 : serealizedAssignedTo.pop();
        let assignedTechId = serealizedAssignedTo === null || serealizedAssignedTo === void 0 ? void 0 : serealizedAssignedTo.join("-");
        const techUserSignature = yield prisma.user.findUnique({
            where: { id: String(assignedTechId) },
            select: { signatureUrl: true },
        });
        const globalEquipmentUsageCount = {};
        getAllTickets.forEach((ticket) => {
            ticket.Equipments.forEach((equipment) => {
                const eqId = equipment.equipmentId;
                if (globalEquipmentUsageCount[eqId]) {
                    globalEquipmentUsageCount[eqId]++;
                }
                else {
                    globalEquipmentUsageCount[eqId] = 1;
                }
            });
        });
        const serializedTickets = getAllTickets.map((ticket) => {
            const { Equipments } = ticket, ticketWithoutEquipments = __rest(ticket, ["Equipments"]);
            const ticketWithEquipmentUsage = Object.assign(Object.assign({}, ticketWithoutEquipments), { techUserSignature: techUserSignature === null || techUserSignature === void 0 ? void 0 : techUserSignature.signatureUrl, usedItems: ticket.usedItems.map((usedItem) => {
                    const { DepotItem } = usedItem, rest = __rest(usedItem, ["DepotItem"]);
                    return Object.assign(Object.assign({}, rest), { name: DepotItem.name });
                }), equipmentUsage: Equipments.map((equipment) => {
                    const eqId = equipment.equipmentId;
                    const eqSerial = equipment.equipment.serialNumber;
                    const eqPatrimonyTag = equipment.equipment.patrimonyTag;
                    const eqName = equipment.equipment.name;
                    return {
                        equipmentId: eqId,
                        usageCount: globalEquipmentUsageCount[eqId] || 0,
                        equipmentSerial: eqSerial,
                        equipmentPatrimony: eqPatrimonyTag,
                        equipmentName: eqName,
                    };
                }) });
            return ticketWithEquipmentUsage;
        });
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        const htmlString = buildHTML(serializedTickets[0]);
        yield page.setContent(htmlString);
        const pdfConfig = {
            path: "meuPDF.pdf",
            format: "A4",
            printBackground: true,
        };
        const pdfBuffer = yield page.pdf(pdfConfig);
        yield browser.close();
        response.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfBuffer.length,
        });
        response.send(pdfBuffer);
    }
    catch (error) {
        console.error("Houve um erro ao gerar o PDF:", error);
        response.status(500).send("Houve um erro ao gerar o PDF");
    }
}));
exports.default = router;
