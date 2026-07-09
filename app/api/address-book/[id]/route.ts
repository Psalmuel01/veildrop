import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.addressBookEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as { label?: string };
  const entry = await prisma.addressBookEntry.update({
    where: { id: params.id },
    data: { label: body.label },
  });
  return NextResponse.json(entry);
}
