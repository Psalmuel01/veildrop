import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RecipientInput {
  address: string;
  amountDisplay: string;
  claimUrl?: string;
  vestingId?: string;
  claimed: boolean;
}

interface CreateDistributionBody {
  adminAddress: string;
  mode: "disperse" | "airdrop" | "vesting";
  template: string;
  title: string;
  description?: string;
  token: string;
  tokenSymbol: string;
  txHash?: string;
  contractAddress?: string;
  claimWindowStart?: string;
  claimWindowEnd?: string;
  cliffSeconds?: number;
  vestingSeconds?: number;
  recipients: RecipientInput[];
}

// Written only after the on-chain transaction has confirmed, see
// app/(admin)/distribute/page.tsx. Never called speculatively, so a row
// existing here always corresponds to something that actually settled.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateDistributionBody;

  if (!body.adminAddress || !body.mode || !body.title || !body.token || !Array.isArray(body.recipients)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const distribution = await prisma.distribution.create({
    data: {
      adminAddress: body.adminAddress.toLowerCase(),
      mode: body.mode,
      template: body.template,
      title: body.title,
      description: body.description,
      token: body.token,
      tokenSymbol: body.tokenSymbol,
      txHash: body.txHash,
      contractAddress: body.contractAddress,
      claimWindowStart: body.claimWindowStart ? new Date(body.claimWindowStart) : undefined,
      claimWindowEnd: body.claimWindowEnd ? new Date(body.claimWindowEnd) : undefined,
      cliffSeconds: body.cliffSeconds,
      vestingSeconds: body.vestingSeconds,
      status: body.mode === "disperse" ? "completed" : "active",
      recipients: {
        create: body.recipients.map((r) => ({
          address: r.address.toLowerCase(),
          amountDisplay: r.amountDisplay,
          claimUrl: r.claimUrl,
          vestingId: r.vestingId,
          claimed: r.claimed,
          claimedAt: r.claimed ? new Date() : undefined,
        })),
      },
    },
    include: { recipients: true },
  });

  return NextResponse.json(distribution, { status: 201 });
}

export async function GET(request: NextRequest) {
  const admin = request.nextUrl.searchParams.get("admin");
  if (!admin) {
    return NextResponse.json({ error: "admin query parameter is required" }, { status: 400 });
  }

  const distributions = await prisma.distribution.findMany({
    where: { adminAddress: admin.toLowerCase() },
    include: { recipients: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(distributions);
}
