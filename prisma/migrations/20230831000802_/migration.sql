/*
  Warnings:

  - Added the required column `cost` to the `DepotItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DepotItem" ADD COLUMN     "cost" INTEGER NOT NULL;
