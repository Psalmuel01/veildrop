import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "owner query parameter is required" }, { status: 400 });
  }

  const drafts = await prisma.draft.findMany({
    where: { ownerAddress: owner.toLowerCase() },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(drafts);
}

interface DraftBody {
  id?: string;
  ownerAddress: string;
  mode: string;
  template: string;
  formState: unknown;
}

// Upsert by id: the wizard creates a draft on first meaningful change, then
// keeps passing the same id back on every debounced auto-save.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as DraftBody;
  if (!body.ownerAddress || !body.mode || !body.template) {
    return NextResponse.json({ error: "ownerAddress, mode, and template are required" }, { status: 400 });
  }

  const ownerAddress = body.ownerAddress.toLowerCase();

  const draft = body.id
    ? await prisma.draft.update({
        where: { id: body.id },
        data: { mode: body.mode, template: body.template, formState: body.formState as never },
      })
    : await prisma.draft.create({
        data: {
          ownerAddress,
          mode: body.mode,
          template: body.template,
          formState: body.formState as never,
        },
      });

  return NextResponse.json(draft, { status: 201 });
}
