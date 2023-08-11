-- CreateTable
CREATE TABLE "MachineInfo" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "release" TEXT NOT NULL,
    "cpu" TEXT NOT NULL,
    "memory" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MachineInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkConnection" (
    "id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "localAddress" TEXT NOT NULL,
    "localPort" TEXT NOT NULL,
    "peerAddress" TEXT NOT NULL,
    "peerPort" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pid" INTEGER NOT NULL,
    "process" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "machineInfoId" TEXT NOT NULL,

    CONSTRAINT "NetworkConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "tty" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "ip" TEXT,
    "command" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "machineInfoId" TEXT NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NetworkConnection" ADD CONSTRAINT "NetworkConnection_machineInfoId_fkey" FOREIGN KEY ("machineInfoId") REFERENCES "MachineInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_machineInfoId_fkey" FOREIGN KEY ("machineInfoId") REFERENCES "MachineInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
