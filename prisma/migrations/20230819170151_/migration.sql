/*
  Warnings:

  - You are about to drop the column `companyId` on the `HistoryMaintenance` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Maintenance` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `TicketCategory` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `TicketPriority` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `TicketResponse` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "HistoryMaintenance" DROP CONSTRAINT "HistoryMaintenance_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Provider" DROP CONSTRAINT "Provider_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TicketCategory" DROP CONSTRAINT "TicketCategory_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TicketPriority" DROP CONSTRAINT "TicketPriority_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TicketResponse" DROP CONSTRAINT "TicketResponse_companyId_fkey";

-- AlterTable
ALTER TABLE "HistoryMaintenance" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "Maintenance" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "TicketCategory" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "TicketPriority" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "TicketResponse" DROP COLUMN "companyId";
