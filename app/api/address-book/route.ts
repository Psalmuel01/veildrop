import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "owner query parameter is required" }, { status: 400 });
  }

  const entries = await prisma.addressBookEntry.findMany({
    where: { ownerAddress: owner.toLowerCase() },
    orderBy: { useCount: "desc" },
  });

  return NextResponse.json(entries);
}

interface AddressBookBody {
  ownerAddress: string;
  address: string;
  label?: string;
  lastAmount?: string;
  incrementUse?: boolean;
}

// Upsert by (ownerAddress, address). Used two ways: explicitly, when an
// admin adds or labels a contact by hand, and automatically, when a
// distribution executes and every recipient gets remembered.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as AddressBookBody;
  if (!body.ownerAddress || !body.address) {
    return NextResponse.json({ error: "ownerAddress and address are required" }, { status: 400 });
  }

  const ownerAddress = body.ownerAddress.toLowerCase();
  const address = body.address.toLowerCase();

  const existing = await prisma.addressBookEntry.findUnique({
    where: { ownerAddress_address: { ownerAddress, address } },
  });

  const entry = await prisma.addressBookEntry.upsert({
    where: { ownerAddress_address: { ownerAddress, address } },
    create: {
      ownerAddress,
      address,
      label: body.label,
      lastAmount: body.lastAmount,
      useCount: body.incrementUse ? 1 : 0,
    },
    update: {
      label: body.label ?? existing?.label,
      lastAmount: body.lastAmount ?? existing?.lastAmount,
      useCount: body.incrementUse ? { increment: 1 } : undefined,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
