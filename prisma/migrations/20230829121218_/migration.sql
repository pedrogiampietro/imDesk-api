/*
  Warnings:

  - You are about to drop the `_UserDepots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Depot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserDepots" DROP CONSTRAINT "_UserDepots_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserDepots" DROP CONSTRAINT "_UserDepots_B_fkey";

-- AlterTable
ALTER TABLE "Depot" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_UserDepots";

-- AddForeignKey
ALTER TABLE "Depot" ADD CONSTRAINT "Depot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
