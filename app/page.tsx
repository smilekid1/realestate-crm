"use client";

import { useEffect, useState } from "react";
import { Phone, Calendar, AlertCircle, TrendingUp, Users, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { scoreLead, scoreLabel } from "@/lib/scoring";

type Lead = {
  id: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  stage: string;
  motivation: string | null;
  condition: string | null;
  timeline: string | null;
  askingPrice: number | null;
  ourOffer: number | null;
  arv: number | null;
  priority: string;
  callbackDate: string | null;
  updatedAt: string;
  notes: { content: string; createdAt: string }[];
};

const STAGES = [
  { key: "new", label: "New Lead", color: "bg-slate-100 border-slate-300" },
  { key: "researched", label: "Researched", color: "bg-blue-50 border-blue-300" },
  { key: "script_ready", label: "Script Ready", color: "bg-purple-50 border-purple-300" },
  { key: "called", label: "Called", color: "bg-yellow-50 border-yellow-300" },
  { key: "follow_up", label: "Follow Up", color: "bg-orange-50 border-orange-300" },
  { key: "under_contract", label: "Under Contract", color: "bg-green-50 border-green-300" },
  { key: "dead", label: "Dead", color: "bg-red-50 border-red-300" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-400",
  low: "bg-gray-400",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => { setLeads(data); setLoading(false); });
  }, []);

  const byStage = (stageKey: string) => leads.filter((l) => l.stage === stageKey);

  const stats = {
    total: leads.length,
    active: leads.filter((l) => !["dead"].includes(l.stage)).length,
    followUp: leads.filter((l) => l.stage === "follow_up").length,
    contracts: leads.filter((l) => l.stage === "under_contract").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading leads...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users size={20} />} label="Total Leads" value={stats.total} color="text-slate-600" />
        <StatCard icon={<TrendingUp size={20} />} label="Active" value={stats.active} color="text-blue-600" />
        <StatCard icon={<AlertCircle size={20} />} label="Follow Up" value={stats.followUp} color="text-orange-600" />
        <StatCard icon={<CheckCircle size={20} />} label="Under Contract" value={stats.contracts} color="text-green-600" />
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No leads yet.</p>
          <a href="/leads/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Add Your First Lead
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {STAGES.map((stage) => {
              const stageLeads = byStage(stage.key);
              return (
                <div key={stage.key} className="w-72 flex-shrink-0">
                  <div className={`rounded-t-lg px-3 py-2 border-b-2 ${stage.color} flex items-center justify-between`}>
                    <span className="font-semibold text-sm text-gray-700">{stage.label}</span>
                    <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className={`rounded-b-lg border border-t-0 ${stage.color} min-h-32 p-2 space-y-2`}>
                    {stageLeads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const isCallbackSoon = lead.callbackDate && new Date(lead.callbackDate) <= new Date(Date.now() + 86400000);
  const score = scoreLead(lead);
  const { label: scoreLabel_, color: scoreColor } = scoreLabel(score);

  return (
    <a href={`/leads/${lead.id}`} className="block bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-sm text-gray-900 truncate">{lead.ownerName}</div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${scoreColor}`}>{scoreLabel_}</span>
          <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[lead.priority] || "bg-gray-400"}`} />
        </div>
      </div>
      <div className="text-xs text-gray-500 truncate mt-0.5">{lead.address}, {lead.city}</div>
      {lead.motivation && (
        <div className="text-xs text-gray-600 mt-1.5 italic truncate">"{lead.motivation}"</div>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        {lead.askingPrice ? (
          <span className="text-xs text-gray-600">Ask: <span className="font-medium">${lead.askingPrice.toLocaleString()}</span></span>
        ) : (
          <span className="text-xs text-gray-400">No price yet</span>
        )}
        {lead.ourOffer && (
          <span className="text-xs text-green-700 font-medium">Offer: ${lead.ourOffer.toLocaleString()}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
          <Phone size={11} /> Call
        </a>
        {isCallbackSoon && (
          <span className="flex items-center gap-1 text-xs text-orange-600">
            <Calendar size={11} /> Callback due
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </a>
  );
}
