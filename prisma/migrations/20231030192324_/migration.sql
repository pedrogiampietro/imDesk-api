-- CreateTable
CREATE TABLE "TicketResponseImage" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ticketResponseId" TEXT NOT NULL,

    CONSTRAINT "TicketResponseImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TicketResponseImage" ADD CONSTRAINT "TicketResponseImage_ticketResponseId_fkey" FOREIGN KEY ("ticketResponseId") REFERENCES "TicketResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
