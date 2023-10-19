/*
  Warnings:

  - A unique constraint covering the columns `[patrimonyTag]` on the table `Equipments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialNumber]` on the table `Equipments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Equipments_patrimonyTag_key" ON "Equipments"("patrimonyTag");

-- CreateIndex
CREATE UNIQUE INDEX "Equipments_serialNumber_key" ON "Equipments"("serialNumber");
