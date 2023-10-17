-- CreateTable
CREATE TABLE "EquipmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentTypeCompany" (
    "id" TEXT NOT NULL,
    "equipmentTypeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentTypeCompany_pkey" PRIMARY KEY ("equipmentTypeId","companyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentTypeCompany_id_key" ON "EquipmentTypeCompany"("id");

-- AddForeignKey
ALTER TABLE "EquipmentTypeCompany" ADD CONSTRAINT "EquipmentTypeCompany_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentTypeCompany" ADD CONSTRAINT "EquipmentTypeCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
