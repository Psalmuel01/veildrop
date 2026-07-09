import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Powers the pending distributions banner on the landing page. Only airdrop
// recipients can be genuinely "pending", disperse pushes tokens directly so
// there is nothing left to claim.
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address query parameter is required" }, { status: 400 });
  }

  const recipients = await prisma.recipient.findMany({
    where: {
      address: address.toLowerCase(),
      claimed: false,
      distribution: { mode: "airdrop" },
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
    claimUrl: r.claimUrl,
    claimWindowEnd: r.distribution.claimWindowEnd,
    createdAt: r.createdAt,
  }));

  return NextResponse.json(pending);
}
