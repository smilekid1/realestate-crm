"use client";

import { useState } from "react";

export default function SubmitLeadPage() {
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ownerName: "", phone: "", address: "", city: "Cleveland", state: "OH", zip: "",
    motivation: "", askingPrice: "", condition: "", timeline: "",
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        askingPrice: form.askingPrice ? parseFloat(form.askingPrice) : null,
        source: "Cold Call",
      }),
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border p-10 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Lead Submitted!</h2>
          <p className="text-gray-500 text-sm mt-2">The lead has been added to the pipeline.</p>
          <button onClick={() => { setDone(false); setForm({ ownerName: "", phone: "", address: "", city: "Cleveland", state: "OH", zip: "", motivation: "", askingPrice: "", condition: "", timeline: "" }); }}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Submit Another Lead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border p-6 max-w-md w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Submit a Lead</h1>
        <p className="text-sm text-gray-500 mb-5">Fill this out for every interested seller.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
            <input required value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)}
              className="input" placeholder="John Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input required value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="input" placeholder="(216) 555-0100" type="tel" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address *</label>
            <input required value={form.address} onChange={(e) => set("address", e.target.value)}
              className="input" placeholder="1234 Euclid Ave" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input value={form.zip} onChange={(e) => set("zip", e.target.value)} className="input" placeholder="44101" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Why are they selling?</label>
            <input value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
              className="input" placeholder="Behind on payments, inherited, relocating..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price ($)</label>
            <input value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)}
              className="input" placeholder="120000" type="number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Condition</label>
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="input">
              <option value="">Select...</option>
              <option>Excellent</option><option>Good</option><option>Fair</option>
              <option>Poor / Needs Work</option><option>Teardown</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timeline to Sell</label>
            <select value={form.timeline} onChange={(e) => set("timeline", e.target.value)} className="input">
              <option value="">Select...</option>
              <option>ASAP</option><option>1-2 weeks</option><option>30 days</option>
              <option>60-90 days</option><option>Flexible</option>
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {saving ? "Submitting..." : "Submit Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}
