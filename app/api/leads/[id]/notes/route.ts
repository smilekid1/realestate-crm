import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/leads/[id]/notes">) {
  const { id } = await ctx.params;
  const { content } = await req.json();
  const note = await prisma.note.create({ data: { content, leadId: id } });
  return Response.json(note, { status: 201 });
}
