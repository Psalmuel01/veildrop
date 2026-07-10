import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatAmount, toBaseUnits } from "@/lib/amount";

interface RecordClaimBody {
  recipientId: string;
  amountDisplay: string;
  txHash: string;
}

// Records a single partial claim against a vesting schedule, after on-chain
// confirmation. Never called speculatively, same discipline as
// POST /api/distributions. Updates the running totalClaimedAmount in the
// same transaction as the VestingClaim row so the two never drift apart.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as RecordClaimBody;

  if (!body.recipientId || !body.amountDisplay || !body.txHash) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const recipient = await prisma.recipient.findUnique({ where: { id: body.recipientId } });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const priorTotal = toBaseUnits(recipient.totalClaimedAmount ?? "0");
  const newTotal = priorTotal + toBaseUnits(body.amountDisplay);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.vestingClaim.create({
      data: {
        recipientId: body.recipientId,
        amountDisplay: body.amountDisplay,
        txHash: body.txHash,
      },
    });
    return tx.recipient.update({
      where: { id: body.recipientId },
      data: { totalClaimedAmount: formatAmount(newTotal) },
      include: { distribution: true, vestingClaims: { orderBy: { claimedAt: "desc" } } },
    });
  });

  return NextResponse.json(updated, { status: 201 });
}
