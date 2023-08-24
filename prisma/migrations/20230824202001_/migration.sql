/*
  Warnings:

  - You are about to drop the `NetworkConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInfo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ipAddress` to the `MachineInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NetworkConnection" DROP CONSTRAINT "NetworkConnection_machineInfoId_fkey";

-- DropForeignKey
ALTER TABLE "UserInfo" DROP CONSTRAINT "UserInfo_machineInfoId_fkey";

-- AlterTable
ALTER TABLE "MachineInfo" ADD COLUMN     "ipAddress" TEXT NOT NULL;

-- DropTable
DROP TABLE "NetworkConnection";

-- DropTable
DROP TABLE "UserInfo";
