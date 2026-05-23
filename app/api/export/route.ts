import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const headers = ["Name", "Phone", "Email", "Address", "City", "State", "ZIP", "Stage", "Motivation", "Condition", "Timeline", "Asking Price", "Our Offer", "ARV", "Max Offer", "Repair Cost", "Priority", "Callback Date", "Created"];
  type Lead = typeof leads[number];
  const rows = leads.map((l: Lead) => [
    l.ownerName, l.phone, l.email || "", l.address, l.city, l.state, l.zip || "",
    l.stage, l.motivation || "", l.condition || "", l.timeline || "",
    l.askingPrice ?? "", l.ourOffer ?? "", l.arv ?? "", l.maxOffer ?? "", l.repairCost ?? "",
    l.priority, l.callbackDate ? new Date(l.callbackDate).toLocaleDateString() : "",
    new Date(l.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
