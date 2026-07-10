import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Powers /received: every distribution of any mode ever sent to this
// address, for the recipient home's activity feed. Vesting rows never flip
// claimed to true, they are told apart by mode plus totalClaimedAmount on
// the frontend rather than the claimed/revealed booleans. Disperse rows are
// terminal (nothing to claim in-app, tokens already landed in the wallet),
// their tx hash lives on Distribution.txHash rather than Recipient.txHash
// since that field is only ever written by the airdrop live-status PATCH,
// exposed here as distributionTxHash so the frontend has a real link to use.
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address query parameter is required" }, { status: 400 });
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      address: address.toLowerCase(),
      distribution: { mode: { in: ["airdrop", "vesting", "disperse"] } },
    },
    include: { distribution: true },
    orderBy: { createdAt: "desc" },
  });

  const history = recipients.map((r) => ({
    id: r.id,
    distributionId: r.distributionId,
    title: r.distribution.title,
    mode: r.distribution.mode,
    adminAddress: r.distribution.adminAddress,
    amountDisplay: r.amountDisplay,
    claimUrl: r.claimUrl,
    claimed: r.claimed,
    claimedAt: r.claimedAt,
    revealed: r.revealed,
    revealedAt: r.revealedAt,
    claimWindowEnd: r.distribution.claimWindowEnd,
    totalClaimedAmount: r.totalClaimedAmount,
    distributionTxHash: r.distribution.txHash,
    createdAt: r.createdAt,
  }));

  return NextResponse.json(history);
}
