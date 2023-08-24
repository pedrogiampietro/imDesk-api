/*
  Warnings:

  - You are about to drop the column `memory` on the `MachineInfo` table. All the data in the column will be lost.
  - Added the required column `macAddress` to the `MachineInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memoryFree` to the `MachineInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memoryTotal` to the `MachineInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userInfo` to the `MachineInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MachineInfo" DROP COLUMN "memory",
ADD COLUMN     "macAddress" TEXT NOT NULL,
ADD COLUMN     "memoryFree" BIGINT NOT NULL,
ADD COLUMN     "memoryTotal" BIGINT NOT NULL,
ADD COLUMN     "userInfo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DiskInfo" (
    "id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "used" BIGINT NOT NULL,
    "available" BIGINT NOT NULL,
    "capacity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "machineInfoId" TEXT NOT NULL,

    CONSTRAINT "DiskInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstalledApp" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayIcon" TEXT,
    "displayVersion" TEXT,
    "installLocation" TEXT,
    "publisher" TEXT,
    "uninstallString" TEXT,
    "otherDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "machineInfoId" TEXT NOT NULL,

    CONSTRAINT "InstalledApp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiskInfo" ADD CONSTRAINT "DiskInfo_machineInfoId_fkey" FOREIGN KEY ("machineInfoId") REFERENCES "MachineInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstalledApp" ADD CONSTRAINT "InstalledApp_machineInfoId_fkey" FOREIGN KEY ("machineInfoId") REFERENCES "MachineInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
