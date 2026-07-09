-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL,
    "adminAddress" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "token" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "txHash" TEXT,
    "contractAddress" TEXT,
    "claimWindowStart" TIMESTAMP(3),
    "claimWindowEnd" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "distributionId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "amountDisplay" TEXT NOT NULL,
    "claimUrl" TEXT,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "revealedAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "txHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressBookEntry" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "lastAmount" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddressBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "formState" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Distribution_adminAddress_idx" ON "Distribution"("adminAddress");

-- CreateIndex
CREATE INDEX "Recipient_address_idx" ON "Recipient"("address");

-- CreateIndex
CREATE INDEX "Recipient_distributionId_idx" ON "Recipient"("distributionId");

-- CreateIndex
CREATE INDEX "AddressBookEntry_ownerAddress_idx" ON "AddressBookEntry"("ownerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "AddressBookEntry_ownerAddress_address_key" ON "AddressBookEntry"("ownerAddress", "address");

-- CreateIndex
CREATE INDEX "Draft_ownerAddress_idx" ON "Draft"("ownerAddress");

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_distributionId_fkey" FOREIGN KEY ("distributionId") REFERENCES "Distribution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
