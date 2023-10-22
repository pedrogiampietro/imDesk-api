import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import puppeteer, { PaperFormat } from 'puppeteer';

const prisma = new PrismaClient();
const router = express.Router();

function formatarData(dateString: string) {
	const date = new Date(dateString);

	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();
	const hour = date.getHours().toString().padStart(2, '0');
	const minute = date.getMinutes().toString().padStart(2, '0');

	return `${day}/${month}/${year} ${hour}:${minute}`;
}

function calcularDiferencaTempo(dataInicial: Date, dataFinal: Date) {
	const date1 = new Date(dataInicial) as any;
	const date2 = new Date(dataFinal) as any;

	if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
		throw new Error('Data inválida fornecida');
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

function buildHTML(ticketData: any) {
	const diff = calcularDiferencaTempo(
		ticketData.createdAt,
		ticketData.closedAt
	);

	const serealizedAssignedTo = ticketData.assignedTo[0].split('-');
	const assignedTo = serealizedAssignedTo[serealizedAssignedTo.length - 1];

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
          <h2>${ticketData.User.currentLoggedCompanyName} - ${
		ticketData.User.sector
	}</h2>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Ordem de Serviço:</label>
              <p>#${ticketData.id.split('-')[0]}</p>
          </div>
         <div class="column">
          <label>Quantidade aberta por Patrimônio:</label>
          <p>#${ticketData.equipmentUsage.usageCount}</p>
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
			<p>${ticketData.TicketEvaluation[0]?.rating}</p>
		</div>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Número de patrimônio:</label>
              <p>${ticketData.equipmentUsage[0]?.equipmentPatrimony}</p>
          </div>
          <div class="column">
              <label>Número de série:</label>
              <p>${ticketData.equipmentUsage[0]?.equipmentSerial}</p></p>
          </div>
          <div class="column">
              <label>Nome do equipamento:</label>
              <p>${ticketData.equipmentUsage[0]?.equipmentName}</p>
          </div>
      </div>
  
      <div class="section">
          <div class="column">
              <label>Descrição do serviço solicitado:</label>
              <p>${ticketData.description}</p>
          </div>
      </div>
  
      <div class="section">
          <label>Observação do serviço executado:</label>
          <p>${ticketData?.observationServiceExecuted}</p>
      </div>  
      <div class="section">
          <div class="column">
              <label>Assinatura do solicitante:</label>
			  ${
					ticketData.User.signatureUrl
						? `<img src="${ticketData.User.signatureUrl}" alt="Assinatura do Solicitante" />`
						: `<p>Assinatura não disponível</p>`
				}
          </div>
		  <div class="column">
		  <label>Assinatura do executante:</label>
		  ${
				ticketData.techUserSignature
					? `<img src="${ticketData.techUserSignature}" alt="Assinatura do Solicitante" />`
					: `<p>Assinatura não disponível</p>`
			}
	  </div>
      </div>
  
      <div class="section">
        <div class="column">
            <label>Valor do reparo (R$):</label>
            <p>R$ ${ticketData?.usedItems?.reduce(
							(total: any, item: any) => total + item.cost,
							0
						)}</p>
        </div>
          <div class="column">
              <label>Motivo da OS:</label>
              <p>${ticketData.ticketType.name}</p>
          </div>
          <div class="column">
              <label>Tempo de execução da atividade:</label>
              <p>${diff.days} dias, ${diff.hours} horas, ${
		diff.minutes
	} minutos, ${diff.seconds} segundos</p>
          </div>
      </div>
  
  </body>
  </html>
    `;

	return html;
}

router.get('/:id', async (request: Request, response: Response) => {
	try {
		const ticketId = request.path;
		const serealizedTicketId = ticketId.replace('/', '');
		const { currentUserId, companyId } = request.query;
		const userIdStr = String(currentUserId);

		if (!companyId || typeof companyId !== 'string') {
			return response.status(400).json({
				message: 'Company ID is required and must be a string.',
				error: true,
			});
		}

		const currentUserGroup = await prisma.user.findUnique({
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
					groupId: currentUserGroup?.Groups?.id,
				},
			],
		};

		const getAllTickets = await prisma.ticket.findMany({
			where: {
				...baseCondition,
				id: serealizedTicketId,
				TicketCompanies: {
					some: {
						companyId: companyId,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
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

		let serealizedAssignedTo = getAllTickets[0]?.assignedTo[0]?.split('-');
		serealizedAssignedTo.pop();
		let assignedTechId = serealizedAssignedTo.join('-');

		const techUserSignature = await prisma.user.findUnique({
			where: { id: String(assignedTechId) },
			select: { signatureUrl: true },
		});

		const globalEquipmentUsageCount = {} as any;

		getAllTickets.forEach((ticket) => {
			ticket.Equipments.forEach((equipment) => {
				const eqId = equipment.equipmentId;

				if (globalEquipmentUsageCount[eqId]) {
					globalEquipmentUsageCount[eqId]++;
				} else {
					globalEquipmentUsageCount[eqId] = 1;
				}
			});
		});

		const serializedTickets = getAllTickets.map((ticket) => {
			const { Equipments, ...ticketWithoutEquipments } = ticket;

			const ticketWithEquipmentUsage = {
				...ticketWithoutEquipments,
				techUserSignature: techUserSignature?.signatureUrl,
				usedItems: ticket.usedItems.map((usedItem) => {
					const { DepotItem, ...rest } = usedItem;
					return {
						...rest,
						name: DepotItem.name,
					};
				}),
				equipmentUsage: Equipments.map((equipment) => {
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
				}),
			};

			return ticketWithEquipmentUsage;
		});

		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		const htmlString = buildHTML(serializedTickets[0]);

		await page.setContent(htmlString);

		const pdfConfig = {
			path: 'meuPDF.pdf',
			format: 'A4' as PaperFormat,
			printBackground: true,
		};

		const pdfBuffer = await page.pdf(pdfConfig);

		await browser.close();

		response.set({
			'Content-Type': 'application/pdf',
			'Content-Length': pdfBuffer.length,
		});
		response.send(pdfBuffer);
	} catch (error) {
		console.error('Houve um erro ao gerar o PDF:', error);
		response.status(500).send('Houve um erro ao gerar o PDF');
	}
});

export default router;
