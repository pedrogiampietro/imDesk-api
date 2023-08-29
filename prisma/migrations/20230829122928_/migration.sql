/*
  Warnings:

  - You are about to drop the column `userId` on the `Depot` table. All the data in the column will be lost.
  - The primary key for the `TicketItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `itemId` on the `TicketItem` table. All the data in the column will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `depotItemId` to the `TicketItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Depot" DROP CONSTRAINT "Depot_userId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_depotId_fkey";

-- DropForeignKey
ALTER TABLE "TicketItem" DROP CONSTRAINT "TicketItem_itemId_fkey";

-- AlterTable
ALTER TABLE "Depot" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "TicketItem" DROP CONSTRAINT "TicketItem_pkey",
DROP COLUMN "itemId",
ADD COLUMN     "depotItemId" TEXT NOT NULL,
ADD CONSTRAINT "TicketItem_pkey" PRIMARY KEY ("ticketId", "depotItemId");

-- DropTable
DROP TABLE "Item";

-- CreateTable
CREATE TABLE "DepotUser" (
    "depotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DepotUser_pkey" PRIMARY KEY ("depotId","userId")
);

-- CreateTable
CREATE TABLE "DepotItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "depotId" TEXT NOT NULL,

    CONSTRAINT "DepotItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DepotUser" ADD CONSTRAINT "DepotUser_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotUser" ADD CONSTRAINT "DepotUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepotItem" ADD CONSTRAINT "DepotItem_depotId_fkey" FOREIGN KEY ("depotId") REFERENCES "Depot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketItem" ADD CONSTRAINT "TicketItem_depotItemId_fkey" FOREIGN KEY ("depotItemId") REFERENCES "DepotItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
