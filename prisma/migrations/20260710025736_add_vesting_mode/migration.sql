-- AlterTable
ALTER TABLE "Distribution" ADD COLUMN     "cliffSeconds" INTEGER,
ADD COLUMN     "vestingSeconds" INTEGER;

-- AlterTable
ALTER TABLE "Recipient" ADD COLUMN     "totalClaimedAmount" TEXT,
ADD COLUMN     "vestingId" TEXT;

-- CreateTable
CREATE TABLE "VestingClaim" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "amountDisplay" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VestingClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VestingClaim_recipientId_idx" ON "VestingClaim"("recipientId");

-- AddForeignKey
ALTER TABLE "VestingClaim" ADD CONSTRAINT "VestingClaim_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
