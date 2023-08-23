/*
  Warnings:

  - You are about to drop the column `slaId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `SLA` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SLA" DROP CONSTRAINT "SLA_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_slaId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "slaId",
ADD COLUMN     "slaDefinitionId" INTEGER;

-- DropTable
DROP TABLE "SLA";

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_slaDefinitionId_fkey" FOREIGN KEY ("slaDefinitionId") REFERENCES "SLADefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
