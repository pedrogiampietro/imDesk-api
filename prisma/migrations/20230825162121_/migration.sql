/*
  Warnings:

  - You are about to drop the column `ticketCategory` on the `SLADefinition` table. All the data in the column will be lost.
  - You are about to drop the column `ticketType` on the `SLADefinition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SLADefinition" DROP COLUMN "ticketCategory",
DROP COLUMN "ticketType";
