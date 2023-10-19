/*
  Warnings:

  - Added the required column `locationId` to the `Equipments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipments" ADD COLUMN     "locationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Equipments" ADD CONSTRAINT "Equipments_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
