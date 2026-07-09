import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RecipientPatchBody {
  claimed?: boolean;
  revealed?: boolean;
  notifiedAt?: boolean;
  txHash?: string;
}

// General patch endpoint for recipient state: claimed, revealed, and
// notified are each set at a different point in the claim flow or by the
// admin sharing a link, so this accepts any subset rather than needing a
// separate endpoint per field.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as RecipientPatchBody;

  const data: Record<string, unknown> = {};
  if (body.claimed !== undefined) {
    data.claimed = body.claimed;
    data.claimedAt = body.claimed ? new Date() : null;
  }
  if (body.revealed !== undefined) {
    data.revealed = body.revealed;
    data.revealedAt = body.revealed ? new Date() : null;
  }
  if (body.notifiedAt) {
    data.notifiedAt = new Date();
  }
  if (body.txHash) {
    data.txHash = body.txHash;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No recognized fields to update" }, { status: 400 });
  }

  const recipient = await prisma.recipient.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(recipient);
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const recipient = await prisma.recipient.findUnique({
    where: { id: params.id },
    include: { distribution: true },
  });

  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  return NextResponse.json(recipient);
}
