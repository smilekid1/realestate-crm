"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLeadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    city: "Cleveland",
    state: "OH",
    zip: "",
    motivation: "",
    askingPrice: "",
    condition: "",
    timeline: "",
    source: "",
    priority: "medium",
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      askingPrice: form.askingPrice ? parseFloat(form.askingPrice) : null,
    };
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const lead = await res.json();
    router.push(`/leads/${lead.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Pipeline</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold">Add New Lead</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
        <Section title="Contact Info">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Owner Name *" required>
              <input required value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)}
                className="input" placeholder="John Smith" />
            </Field>
            <Field label="Phone *" required>
              <input required value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="input" placeholder="(216) 555-0100" type="tel" />
            </Field>
            <Field label="Email" className="col-span-2">
              <input value={form.email} onChange={(e) => set("email", e.target.value)}
                className="input" placeholder="owner@email.com" type="email" />
            </Field>
          </div>
        </Section>

        <Section title="Property">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Street Address *" className="col-span-2" required>
              <input required value={form.address} onChange={(e) => set("address", e.target.value)}
                className="input" placeholder="1234 Euclid Ave" />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className="input" />
            </Field>
            <Field label="ZIP">
              <input value={form.zip} onChange={(e) => set("zip", e.target.value)} className="input" placeholder="44101" />
            </Field>
            <Field label="Asking Price ($)">
              <input value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)}
                className="input" placeholder="120000" type="number" />
            </Field>
            <Field label="Lead Source">
              <select value={form.source} onChange={(e) => set("source", e.target.value)} className="input">
                <option value="">Select...</option>
                <option>Cold Call</option>
                <option>Direct Mail</option>
                <option>Driving for Dollars</option>
                <option>Referral</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Seller Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Motivation (why selling?)" className="col-span-2">
              <input value={form.motivation} onChange={(e) => set("motivation", e.target.value)}
                className="input" placeholder="Behind on payments, inherited, relocating..." />
            </Field>
            <Field label="Property Condition">
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className="input">
                <option value="">Select...</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor / Needs Work</option>
                <option>Teardown</option>
              </select>
            </Field>
            <Field label="Timeline to Sell">
              <select value={form.timeline} onChange={(e) => set("timeline", e.target.value)} className="input">
                <option value="">Select...</option>
                <option>ASAP</option>
                <option>1-2 weeks</option>
                <option>30 days</option>
                <option>60-90 days</option>
                <option>Flexible</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="input">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
          </div>
        </Section>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Save Lead"}
          </button>
          <a href="/" className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, className, required }: { label: string; children: React.ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
