/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `TicketCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `childrenName` to the `TicketCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketCategory" ADD COLUMN     "childrenName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TicketCategory_name_key" ON "TicketCategory"("name");
