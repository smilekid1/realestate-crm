import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: "desc" },
    include: { notes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return Response.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const lead = await prisma.lead.create({ data: body });
  return Response.json(lead, { status: 201 });
}
