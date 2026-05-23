"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Phone, MapPin, Calendar, Trash2, Save, RefreshCw, FileText, Calculator, Home, MessageSquare, TrendingUp } from "lucide-react";
import { format } from "date-fns";

type Note = { id: string; content: string; createdAt: string };
type Lead = {
  id: string; ownerName: string; phone: string; email: string; address: string;
  city: string; state: string; zip: string; stage: string; motivation: string;
  askingPrice: number | null; condition: string; timeline: string; source: string;
  beds: number | null; baths: number | null; sqft: number | null; yearBuilt: number | null;
  estimatedValue: number | null; arv: number | null; repairCost: number | null;
  maxOffer: number | null; ourOffer: number | null; callbackDate: string | null;
  priority: string; notes: Note[];
};

const STAGES = [
  { key: "new", label: "New Lead" },
  { key: "researched", label: "Researched" },
  { key: "script_ready", label: "Script Ready" },
  { key: "called", label: "Called" },
  { key: "follow_up", label: "Follow Up" },
  { key: "under_contract", label: "Under Contract" },
  { key: "dead", label: "Dead" },
];

type Tab = "overview" | "research" | "calculator" | "analyzer" | "script" | "notes";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changes, setChanges] = useState<Partial<Lead>>({});

  useEffect(() => {
    fetch(`/api/leads/${id}`).then((r) => r.json()).then(setLead);
  }, [id]);

  if (!lead) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  const merged = { ...lead, ...changes };

  function patch(field: string, value: unknown) {
    setChanges((c) => ({ ...c, [field]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    const updated = await res.json();
    setLead(updated);
    setChanges({});
    setSaving(false);
  }

  async function deleteLead() {
    if (!confirm("Delete this lead permanently?")) return;
    setDeleting(true);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    router.push("/");
  }

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Pipeline</a>
          <h1 className="text-2xl font-bold mt-1">{lead.ownerName}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><MapPin size={14} />{lead.address}, {lead.city}, {lead.state}</span>
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
              <Phone size={14} />{lead.phone}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select value={merged.stage} onChange={(e) => patch("stage", e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white">
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {hasChanges && (
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              <Save size={14} />{saving ? "Saving..." : "Save"}
            </button>
          )}
          <button onClick={deleteLead} disabled={deleting}
            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {([ ["overview", Home, "Overview"], ["research", RefreshCw, "Research"], ["calculator", Calculator, "Offer Calc"], ["analyzer", TrendingUp, "Deal Analyzer"], ["script", FileText, "Call Script"], ["notes", MessageSquare, "Notes"] ] as [Tab, React.ElementType, string][]).map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab lead={merged} patch={patch} />}
      {tab === "research" && <ResearchTab lead={merged} patch={patch} />}
      {tab === "calculator" && <CalculatorTab lead={merged} patch={patch} />}
      {tab === "analyzer" && <DealAnalyzerTab lead={merged} />}
      {tab === "script" && <ScriptTab lead={merged} />}
      {tab === "notes" && <NotesTab lead={lead} onNoteAdded={(note) => setLead((l) => l ? { ...l, notes: [note, ...l.notes] } : l)} />}
    </div>
  );
}

function OverviewTab({ lead, patch }: { lead: Partial<Lead>; patch: (f: string, v: unknown) => void }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="font-semibold text-gray-700">Seller Info</h3>
        <LabeledField label="Motivation">
          <input className="input" value={lead.motivation || ""} onChange={(e) => patch("motivation", e.target.value)} placeholder="Why are they selling?" />
        </LabeledField>
        <LabeledField label="Condition">
          <select className="input" value={lead.condition || ""} onChange={(e) => patch("condition", e.target.value)}>
            <option value="">Select...</option>
            <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor / Needs Work</option><option>Teardown</option>
          </select>
        </LabeledField>
        <LabeledField label="Timeline">
          <select className="input" value={lead.timeline || ""} onChange={(e) => patch("timeline", e.target.value)}>
            <option value="">Select...</option>
            <option>ASAP</option><option>1-2 weeks</option><option>30 days</option><option>60-90 days</option><option>Flexible</option>
          </select>
        </LabeledField>
        <LabeledField label="Priority">
          <select className="input" value={lead.priority || "medium"} onChange={(e) => patch("priority", e.target.value)}>
            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
          </select>
        </LabeledField>
        <LabeledField label="Asking Price ($)">
          <input type="number" className="input" value={lead.askingPrice ?? ""} onChange={(e) => patch("askingPrice", e.target.value ? parseFloat(e.target.value) : null)} />
        </LabeledField>
      </div>
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="font-semibold text-gray-700">Follow Up</h3>
        <LabeledField label="Callback Date">
          <input type="datetime-local" className="input" value={lead.callbackDate ? lead.callbackDate.slice(0, 16) : ""}
            onChange={(e) => patch("callbackDate", e.target.value || null)} />
        </LabeledField>
        <LabeledField label="Email">
          <input type="email" className="input" value={lead.email || ""} onChange={(e) => patch("email", e.target.value)} />
        </LabeledField>
        {lead.callbackDate && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2 text-sm text-orange-800">
            <Calendar size={14} />
            Callback: {format(new Date(lead.callbackDate), "MMM d, yyyy 'at' h:mm a")}
          </div>
        )}
      </div>
    </div>
  );
}

function ResearchTab({ lead, patch }: { lead: Partial<Lead>; patch: (f: string, v: unknown) => void }) {
  const [loading, setLoading] = useState(false);
  type Comparable = { formattedAddress?: string; addressLine1?: string; price: number; squareFootage?: number; daysOld?: number; status?: string };
  type Comps = { price?: number; priceRangeLow?: number; priceRangeHigh?: number; comparables?: Comparable[] };
  type ResearchResult = { property?: Record<string, unknown>; comps?: Comps; error?: string; mock?: boolean };
  const [result, setResult] = useState<ResearchResult | null>(null);

  async function runResearch() {
    setLoading(true);
    const params = new URLSearchParams({
      address: lead.address || "",
      city: lead.city || "Cleveland",
      state: lead.state || "OH",
    });
    const res = await fetch(`/api/research?${params}`);
    const data = await res.json();
    setResult(data);

    if (data.data || data.property || data.comps) {
      const src = data.data || data;
      if (src.property) {
        patch("beds", src.property.bedrooms || null);
        patch("baths", src.property.bathrooms || null);
        patch("sqft", src.property.squareFootage || null);
        patch("yearBuilt", src.property.yearBuilt || null);
        patch("estimatedValue", src.property.estimatedValue || null);
      }
      if (src.comps?.price) {
        patch("arv", src.comps.price);
      }
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {result?.mock && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
          Using mock data — add your RENTCAST_API_KEY in .env.local for real comps.
        </div>
      )}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Property Research</h3>
          <button onClick={runResearch} disabled={loading}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Researching..." : "Pull Data"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            ["Beds", "beds"], ["Baths", "baths"], ["Sqft", "sqft"],
            ["Year Built", "yearBuilt"], ["Est. Value ($)", "estimatedValue"], ["ARV ($)", "arv"]
          ].map(([label, field]) => (
            <LabeledField key={field} label={label}>
              <input type="number" className="input" value={(lead as Record<string, unknown>)[field] as number ?? ""}
                onChange={(e) => patch(field, e.target.value ? parseFloat(e.target.value) : null)} />
            </LabeledField>
          ))}
        </div>

        {result?.comps && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-600">Comparable Sales</h4>
              {result.comps?.price && (
                <span className="text-sm font-semibold text-blue-700">
                  Est. Value: ${(result.comps.price as number).toLocaleString()}
                  {result.comps.priceRangeLow && result.comps.priceRangeHigh && (
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      (${(result.comps.priceRangeLow as number).toLocaleString()} – ${(result.comps.priceRangeHigh as number).toLocaleString()})
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {result.comps.comparables?.map((c, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700">{c.formattedAddress || c.addressLine1}</span>
                  <div className="flex gap-4 text-right">
                    <span className="font-medium text-green-700">${c.price.toLocaleString()}</span>
                    {c.squareFootage && <span className="text-gray-500">{c.squareFootage} sqft</span>}
                    {c.daysOld !== undefined && <span className="text-gray-400">{c.daysOld}d ago</span>}
                    {c.status && <span className={`text-xs px-1.5 py-0.5 rounded ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CalculatorTab({ lead, patch }: { lead: Partial<Lead>; patch: (f: string, v: unknown) => void }) {
  const arv = lead.arv || 0;
  const repairs = lead.repairCost || 0;
  const maxOffer = arv * 0.7 - repairs;
  const asking = lead.askingPrice || 0;
  const spread = asking ? asking - maxOffer : null;

  useEffect(() => {
    if (arv > 0) patch("maxOffer", Math.max(0, maxOffer));
  }, [arv, repairs]);

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="font-semibold text-gray-700">Offer Calculator (70% Rule)</h3>

        <LabeledField label="After Repair Value — ARV ($)">
          <input type="number" className="input" value={lead.arv ?? ""}
            onChange={(e) => patch("arv", e.target.value ? parseFloat(e.target.value) : null)} placeholder="0" />
        </LabeledField>

        <LabeledField label="Estimated Repair Cost ($)">
          <input type="number" className="input" value={lead.repairCost ?? ""}
            onChange={(e) => patch("repairCost", e.target.value ? parseFloat(e.target.value) : null)} placeholder="0" />
        </LabeledField>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ARV × 70%</span>
            <span className="font-medium">${(arv * 0.7).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">− Repairs</span>
            <span className="font-medium text-red-600">−${repairs.toLocaleString()}</span>
          </div>
          <div className="border-t border-blue-200 pt-2 flex justify-between">
            <span className="font-bold text-gray-800">Max Offer</span>
            <span className="font-bold text-xl text-blue-700">${Math.max(0, maxOffer).toLocaleString()}</span>
          </div>
        </div>

        {asking > 0 && (
          <div className={`rounded-lg p-3 text-sm flex justify-between ${spread && spread > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            <span>Gap vs. Asking Price</span>
            <span className="font-semibold">{spread && spread > 0 ? `They're $${spread.toLocaleString()} over` : `Deal is ${spread ? `$${Math.abs(spread).toLocaleString()} under` : "at"} max offer`}</span>
          </div>
        )}

        <LabeledField label="Our Actual Offer ($)">
          <input type="number" className="input" value={lead.ourOffer ?? ""}
            onChange={(e) => patch("ourOffer", e.target.value ? parseFloat(e.target.value) : null)} placeholder={maxOffer > 0 ? Math.max(0, maxOffer).toString() : "0"} />
        </LabeledField>
      </div>
    </div>
  );
}

function DealAnalyzerTab({ lead }: { lead: Partial<Lead> }) {
  const arv = lead.arv || 0;
  const repairs = lead.repairCost || 0;
  const asking = lead.askingPrice || 0;

  // Wholesale
  const wholesaleFee = 10000;
  const maxWholesaleOffer = arv * 0.7 - repairs - wholesaleFee;
  const wholesaleProfit = wholesaleFee;
  const wholesaleWorks = maxWholesaleOffer > 0 && (!asking || asking <= maxWholesaleOffer);

  // Fix & Flip
  const holdingCosts = arv * 0.03;
  const closingCosts = arv * 0.02;
  const flipProfit = arv - repairs - holdingCosts - closingCosts - (lead.ourOffer || maxWholesaleOffer);
  const flipROI = lead.ourOffer ? (flipProfit / (lead.ourOffer + repairs)) * 100 : 0;
  const flipWorks = flipProfit >= 20000;

  // BRRRR / Refi (Buy, Rehab, Rent, Refi, Repeat)
  const estimatedRent = arv * 0.008; // ~0.8% rent rule
  const afterRefiValue = arv * 0.75;
  const monthlyMortgage = afterRefiValue * 0.006;
  const monthlyCashflow = estimatedRent - monthlyMortgage - 300;
  const brrrrWorks = monthlyCashflow > 0;

  const recommend = wholesaleWorks ? "wholesale" : flipWorks ? "flip" : brrrrWorks ? "brrrr" : "none";

  if (!arv) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
        <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Fill in the ARV and Repair Cost in the Offer Calc tab first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommend !== "none" && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-4">
          <p className="font-semibold text-green-800 text-sm">
            Best Exit Strategy: <span className="uppercase">{recommend === "brrrr" ? "BRRRR / Refinance" : recommend === "flip" ? "Fix & Flip" : "Wholesale"}</span>
          </p>
          <p className="text-xs text-green-700 mt-1">Based on your numbers, this deal makes the most sense as a {recommend === "brrrr" ? "rental/refi" : recommend}.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wholesale */}
        <div className={`bg-white rounded-xl border-2 p-5 ${wholesaleWorks ? "border-blue-400" : "border-gray-200 opacity-60"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Wholesale</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${wholesaleWorks ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
              {wholesaleWorks ? "✓ Works" : "✗ Tight"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Max Offer to Seller" value={`$${Math.max(0, maxWholesaleOffer).toLocaleString()}`} />
            <Row label="Your Wholesale Fee" value={`$${wholesaleFee.toLocaleString()}`} highlight />
            <Row label="Time to Close" value="7–21 days" />
            <Row label="Risk" value="Low — no rehab" />
          </div>
        </div>

        {/* Fix & Flip */}
        <div className={`bg-white rounded-xl border-2 p-5 ${flipWorks ? "border-orange-400" : "border-gray-200 opacity-60"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Fix & Flip</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${flipWorks ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
              {flipWorks ? "✓ Works" : "✗ Low profit"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Est. Profit" value={`$${Math.round(flipProfit).toLocaleString()}`} highlight={flipWorks} />
            <Row label="ROI" value={`${flipROI.toFixed(1)}%`} />
            <Row label="Holding Costs" value={`$${Math.round(holdingCosts).toLocaleString()}`} />
            <Row label="Closing Costs" value={`$${Math.round(closingCosts).toLocaleString()}`} />
            <Row label="Time to Close" value="3–6 months" />
          </div>
        </div>

        {/* BRRRR */}
        <div className={`bg-white rounded-xl border-2 p-5 ${brrrrWorks ? "border-purple-400" : "border-gray-200 opacity-60"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">BRRRR / Refi</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${brrrrWorks ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
              {brrrrWorks ? "✓ Cash flows" : "✗ Negative"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Est. Monthly Rent" value={`$${Math.round(estimatedRent).toLocaleString()}`} />
            <Row label="After-Refi Loan" value={`$${Math.round(afterRefiValue).toLocaleString()}`} />
            <Row label="Est. Mortgage" value={`$${Math.round(monthlyMortgage).toLocaleString()}/mo`} />
            <Row label="Monthly Cashflow" value={`$${Math.round(monthlyCashflow).toLocaleString()}/mo`} highlight={brrrrWorks} />
            <Row label="Risk" value="Requires management" />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Estimates only. Always verify with your accountant and contractor before making decisions.
      </p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? "text-green-700" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}

function ScriptTab({ lead }: { lead: Partial<Lead> }) {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    setScript(data.script);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-700">AI Call Script</h3>
            <p className="text-xs text-gray-500 mt-0.5">Generated specifically for {lead.ownerName} based on their situation</p>
          </div>
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-60">
            <FileText size={14} />
            {loading ? "Generating..." : script ? "Regenerate" : "Generate Script"}
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">{error}</div>}

        {!script && !loading && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Click Generate Script to create a custom call script for this lead.</p>
            <p className="text-xs mt-1">Fill in the offer calculator first for the best results.</p>
          </div>
        )}

        {script && (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed bg-gray-50 rounded-lg p-4">{script}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesTab({ lead, onNoteAdded }: { lead: Lead; onNoteAdded: (note: Note) => void }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/leads/${lead.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const note = await res.json();
    onNoteAdded(note);
    setContent("");
    setSaving(false);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3} placeholder="Add a call note, update, or reminder..." />
        <button onClick={addNote} disabled={saving || !content.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving..." : "Add Note"}
        </button>
      </div>
      <div className="space-y-2">
        {lead.notes.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No notes yet.</p>}
        {lead.notes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-800 leading-relaxed">{note.content}</p>
            <p className="text-xs text-gray-400 mt-2">{format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
