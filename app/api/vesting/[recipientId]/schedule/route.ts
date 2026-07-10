import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Everything the /vesting/[id] recipient page needs from the backend in one
// call: the recipient's on-chain schedule identifiers, the distribution's
// cliff/vesting configuration and manager contract address, and the full
// claim history. Live on-chain state (real timestamps, claimable amount)
// comes from the SDK client-side, not from here.
export async function GET(_request: NextRequest, { params }: { params: { recipientId: string } }) {
  const recipient = await prisma.recipient.findUnique({
    where: { id: params.recipientId },
    include: {
      distribution: true,
      vestingClaims: { orderBy: { claimedAt: "desc" } },
    },
  });

  if (!recipient || recipient.distribution.mode !== "vesting") {
    return NextResponse.json({ error: "Vesting schedule not found" }, { status: 404 });
  }

  return NextResponse.json(recipient);
}
