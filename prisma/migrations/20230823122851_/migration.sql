/*
  Warnings:

  - Added the required column `ticketCategory` to the `SLADefinition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SLADefinition" ADD COLUMN     "ticketCategory" TEXT NOT NULL;
