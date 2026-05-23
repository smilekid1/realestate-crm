import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(lead);
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();

  // Strip non-scalar fields that can't be set directly
  const { notes, id: _id, createdAt, updatedAt, ...data } = body;
  void notes; void _id; void createdAt; void updatedAt;

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data,
      include: { notes: { orderBy: { createdAt: "desc" } } },
    });
    return Response.json(lead);
  } catch (err) {
    console.error("PATCH lead error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  await prisma.lead.delete({ where: { id } });
  return Response.json({ success: true });
}
