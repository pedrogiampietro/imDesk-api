-- CreateTable
CREATE TABLE "SLADefinition" (
    "id" SERIAL NOT NULL,
    "ticketType" TEXT NOT NULL,
    "ticketPriority" TEXT NOT NULL,
    "resolutionTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLADefinition_pkey" PRIMARY KEY ("id")
);
