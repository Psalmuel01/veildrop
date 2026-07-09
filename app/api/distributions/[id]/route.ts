import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const distribution = await prisma.distribution.findUnique({
    where: { id: params.id },
    include: { recipients: true },
  });

  if (!distribution) {
    return NextResponse.json({ error: "Distribution not found" }, { status: 404 });
  }

  return NextResponse.json(distribution);
}
