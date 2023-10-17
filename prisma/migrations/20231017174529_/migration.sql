-- AlterTable
ALTER TABLE "EquipmentCompany" ADD COLUMN     "groupId" INTEGER;

-- AddForeignKey
ALTER TABLE "EquipmentCompany" ADD CONSTRAINT "EquipmentCompany_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
