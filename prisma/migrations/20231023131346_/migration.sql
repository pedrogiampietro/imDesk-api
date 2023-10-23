-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ticketWasSignedTech" BOOLEAN DEFAULT false,
ADD COLUMN     "ticketWasSignedUser" BOOLEAN DEFAULT false;
