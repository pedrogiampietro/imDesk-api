-- DropForeignKey
ALTER TABLE "TicketPriority" DROP CONSTRAINT "TicketPriority_companyId_fkey";

-- AlterTable
ALTER TABLE "TicketPriority" ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TicketPriorityCompany" (
    "ticketPriorityId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "TicketPriorityCompany_pkey" PRIMARY KEY ("ticketPriorityId","companyId")
);

-- AddForeignKey
ALTER TABLE "TicketPriority" ADD CONSTRAINT "TicketPriority_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPriorityCompany" ADD CONSTRAINT "TicketPriorityCompany_ticketPriorityId_fkey" FOREIGN KEY ("ticketPriorityId") REFERENCES "TicketPriority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPriorityCompany" ADD CONSTRAINT "TicketPriorityCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
