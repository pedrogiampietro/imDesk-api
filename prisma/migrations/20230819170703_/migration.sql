/*
  Warnings:

  - Added the required column `companyId` to the `TicketCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TicketPriority` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketCategory" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketPriority" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TicketPriority" ADD CONSTRAINT "TicketPriority_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCategory" ADD CONSTRAINT "TicketCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
