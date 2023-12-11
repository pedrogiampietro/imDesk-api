/*
  Warnings:

  - The `assignedToAt` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "assignedToAt",
ADD COLUMN     "assignedToAt" TIMESTAMP(3)[];
