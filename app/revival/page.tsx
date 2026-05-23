"use client";

import { useEffect, useState } from "react";
import { Phone, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Lead = {
  id: string; ownerName: string; phone: string; address: string; city: string;
  motivation: string | null; askingPrice: number | null; stage: string; updatedAt: string;
};

export default function RevivalPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviving, setReviving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data: Lead[]) => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const dead = data.filter((l) => l.stage === "dead" && new Date(l.updatedAt) <= thirtyDaysAgo);
        setLeads(dead);
        setLoading(false);
      });
  }, []);

  async function revive(lead: Lead) {
    setReviving(lead.id);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: "follow_up" }),
    });
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setReviving(null);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dead Leads Revival</h1>
        <p className="text-gray-500 text-sm mt-1">Leads marked dead 30+ days ago — market changes, people's situations change. Worth a follow-up call.</p>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No dead leads older than 30 days.</p>
          <p className="text-sm mt-1">Check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{lead.ownerName}</div>
                <div className="text-xs text-gray-500">{lead.address}, {lead.city}</div>
                {lead.motivation && <div className="text-xs text-gray-600 italic mt-1">"{lead.motivation}"</div>}
                <div className="text-xs text-gray-400 mt-1">
                  Dead {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
                  {lead.askingPrice && ` · Asked $${lead.askingPrice.toLocaleString()}`}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href={`tel:${lead.phone}`} className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
                  <Phone size={13} /> Call
                </a>
                <button onClick={() => revive(lead)} disabled={reviving === lead.id}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                  <RefreshCw size={13} /> Revive
                </button>
                <a href={`/leads/${lead.id}`} className="px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
