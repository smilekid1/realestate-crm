"use client";

import { useEffect, useState } from "react";
import { Phone, Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { format, isToday, isPast, isTomorrow, formatDistanceToNow } from "date-fns";

type Lead = {
  id: string;
  ownerName: string;
  phone: string;
  address: string;
  city: string;
  stage: string;
  motivation: string | null;
  askingPrice: number | null;
  ourOffer: number | null;
  priority: string;
  callbackDate: string | null;
  updatedAt: string;
};

export default function TodayPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [called, setCalled] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => { setLeads(data); setLoading(false); });
  }, []);

  const withCallback = leads.filter((l) => l.callbackDate);
  const overdue = withCallback.filter((l) => l.callbackDate && isPast(new Date(l.callbackDate)) && !isToday(new Date(l.callbackDate)));
  const dueToday = withCallback.filter((l) => l.callbackDate && isToday(new Date(l.callbackDate)));
  const dueTomorrow = withCallback.filter((l) => l.callbackDate && isTomorrow(new Date(l.callbackDate)));
  const newLeads = leads.filter((l) => l.stage === "new").slice(0, 5);

  const markCalled = (id: string) => setCalled((prev) => new Set([...prev, id]));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Good morning 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")} — Here's who to call today</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={<AlertTriangle size={18} />} label="Overdue" value={overdue.length} color="text-red-600 bg-red-50 border-red-200" />
        <SummaryCard icon={<Clock size={18} />} label="Due Today" value={dueToday.length} color="text-orange-600 bg-orange-50 border-orange-200" />
        <SummaryCard icon={<Calendar size={18} />} label="Tomorrow" value={dueTomorrow.length} color="text-blue-600 bg-blue-50 border-blue-200" />
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="Overdue Callbacks" icon={<AlertTriangle size={16} className="text-red-500" />}>
          {overdue.map((lead) => (
            <CallCard key={lead.id} lead={lead} called={called.has(lead.id)} onCalled={markCalled} badge="OVERDUE" badgeColor="bg-red-100 text-red-700" />
          ))}
        </Section>
      )}

      {/* Due today */}
      <Section title="Call Today" icon={<Clock size={16} className="text-orange-500" />}>
        {dueToday.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No callbacks scheduled for today.</p>
        ) : (
          dueToday.map((lead) => (
            <CallCard key={lead.id} lead={lead} called={called.has(lead.id)} onCalled={markCalled} />
          ))
        )}
      </Section>

      {/* New leads to follow up on */}
      {newLeads.length > 0 && (
        <Section title="New Leads — Haven't Called Yet" icon={<Phone size={16} className="text-blue-500" />}>
          {newLeads.map((lead) => (
            <CallCard key={lead.id} lead={lead} called={called.has(lead.id)} onCalled={markCalled} badge="NEW" badgeColor="bg-blue-100 text-blue-700" />
          ))}
        </Section>
      )}

      {/* Tomorrow preview */}
      {dueTomorrow.length > 0 && (
        <Section title="Tomorrow's Callbacks" icon={<Calendar size={16} className="text-gray-400" />}>
          {dueTomorrow.map((lead) => (
            <CallCard key={lead.id} lead={lead} called={called.has(lead.id)} onCalled={markCalled} muted />
          ))}
        </Section>
      )}

      {overdue.length === 0 && dueToday.length === 0 && newLeads.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">You're all caught up!</p>
          <p className="text-sm mt-1">No callbacks due. Add leads or check the pipeline.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${color}`}>
      {icon}
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CallCard({ lead, called, onCalled, badge, badgeColor, muted }: {
  lead: Lead; called: boolean; onCalled: (id: string) => void;
  badge?: string; badgeColor?: string; muted?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-opacity ${called ? "opacity-40" : ""} ${muted ? "opacity-70" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{lead.ownerName}</span>
          {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>}
          {called && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Called ✓</span>}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{lead.address}, {lead.city}</div>
        {lead.motivation && <div className="text-xs text-gray-600 italic mt-1 truncate">"{lead.motivation}"</div>}
        {lead.callbackDate && (
          <div className="text-xs text-gray-400 mt-1">
            Scheduled: {format(new Date(lead.callbackDate), "MMM d 'at' h:mm a")} ({formatDistanceToNow(new Date(lead.callbackDate), { addSuffix: true })})
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 items-end flex-shrink-0">
        <a href={`tel:${lead.phone}`}
          onClick={() => onCalled(lead.id)}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          <Phone size={14} /> {lead.phone}
        </a>
        <a href={`/leads/${lead.id}`} className="text-xs text-blue-600 hover:text-blue-800">
          View lead →
        </a>
      </div>
    </div>
  );
}
