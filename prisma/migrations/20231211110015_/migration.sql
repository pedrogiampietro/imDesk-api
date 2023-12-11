-- AlterTable
ALTER TABLE "Provider" ADD COLUMN     "adendum" TEXT,
ADD COLUMN     "contractNumber" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "monthlyValue" DOUBLE PRECISION,
ADD COLUMN     "operationDate" TIMESTAMP(3),
ADD COLUMN     "serviceProvided" TEXT;
