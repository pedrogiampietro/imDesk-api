/*
  Warnings:

  - You are about to drop the column `currentLoggedCompany` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentLoggedCompany",
ADD COLUMN     "currentLoggedCompanyId" TEXT,
ADD COLUMN     "currentLoggedCompanyName" TEXT;
