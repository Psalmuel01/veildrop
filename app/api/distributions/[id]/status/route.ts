import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const distribution = await prisma.distribution.update({
    where: { id: params.id },
    data: { status: body.status },
  });

  return NextResponse.json(distribution);
}
