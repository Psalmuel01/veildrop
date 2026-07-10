import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Powers the pending distributions banner on the landing page. Airdrop and
// vesting recipients can be genuinely "pending" (unclaimed link, or an
// ongoing schedule with something to check on), disperse pushes tokens
// directly so there is nothing left to claim. Vesting rows never flip
// claimed to true, so they stay pending here for the life of the schedule.
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address query parameter is required" }, { status: 400 });
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      address: address.toLowerCase(),
      claimed: false,
      distribution: { mode: { in: ["airdrop", "vesting"] } },
    },
    include: { distribution: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = recipients.map((r) => ({
    id: r.id,
    distributionId: r.distributionId,
    title: r.distribution.title,
    mode: r.distribution.mode,
    adminAddress: r.distribution.adminAddress,
    amountDisplay: r.amountDisplay,
    tokenSymbol: r.distribution.tokenSymbol,
    claimUrl: r.claimUrl,
    claimWindowEnd: r.distribution.claimWindowEnd,
    totalClaimedAmount: r.totalClaimedAmount,
    createdAt: r.createdAt,
  }));

  return NextResponse.json(pending);
}
