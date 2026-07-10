import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Powers /received: every airdrop or vesting allocation ever sent to this
// address, for the pending and claimed history sections. Vesting rows never
// flip claimed to true, they are told apart by mode plus totalClaimedAmount
// on the frontend rather than the claimed/revealed booleans.
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address query parameter is required" }, { status: 400 });
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      address: address.toLowerCase(),
      distribution: { mode: { in: ["airdrop", "vesting"] } },
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
    createdAt: r.createdAt,
  }));

  return NextResponse.json(history);
}
