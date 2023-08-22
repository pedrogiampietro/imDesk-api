/*
  Warnings:

  - You are about to drop the column `companyId` on the `TicketPriority` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `TicketType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketPriority" DROP CONSTRAINT "TicketPriority_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TicketType" DROP CONSTRAINT "TicketType_companyId_fkey";

-- AlterTable
ALTER TABLE "TicketPriority" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "companyId";

-- CreateTable
CREATE TABLE "TicketTypeCompany" (
    "ticketTypeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "TicketTypeCompany_pkey" PRIMARY KEY ("ticketTypeId","companyId")
);

-- AddForeignKey
ALTER TABLE "TicketTypeCompany" ADD CONSTRAINT "TicketTypeCompany_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTypeCompany" ADD CONSTRAINT "TicketTypeCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
