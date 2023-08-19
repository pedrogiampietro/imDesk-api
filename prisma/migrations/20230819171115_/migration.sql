/*
  Warnings:

  - Added the required column `companyId` to the `TicketResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketResponse" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
