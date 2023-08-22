/*
  Warnings:

  - You are about to drop the column `companyId` on the `TicketCategory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketCategory" DROP CONSTRAINT "TicketCategory_companyId_fkey";

-- AlterTable
ALTER TABLE "TicketCategory" DROP COLUMN "companyId";

-- CreateTable
CREATE TABLE "TicketCategoryCompany" (
    "ticketCategoryId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "TicketCategoryCompany_pkey" PRIMARY KEY ("ticketCategoryId","companyId")
);

-- AddForeignKey
ALTER TABLE "TicketCategoryCompany" ADD CONSTRAINT "TicketCategoryCompany_ticketCategoryId_fkey" FOREIGN KEY ("ticketCategoryId") REFERENCES "TicketCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCategoryCompany" ADD CONSTRAINT "TicketCategoryCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
