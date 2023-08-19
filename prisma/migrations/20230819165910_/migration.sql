/*
  Warnings:

  - Added the required column `companyId` to the `HistoryMaintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Maintenance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TicketCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TicketPriority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TicketResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `TicketType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HistoryMaintenance" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketCategory" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketPriority" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketResponse" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketType" ADD COLUMN     "companyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPriority" ADD CONSTRAINT "TicketPriority_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCategory" ADD CONSTRAINT "TicketCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryMaintenance" ADD CONSTRAINT "HistoryMaintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketResponse" ADD CONSTRAINT "TicketResponse_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
