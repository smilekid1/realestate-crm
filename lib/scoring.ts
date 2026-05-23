type ScoredLead = {
  motivation: string | null;
  condition: string | null;
  timeline: string | null;
  askingPrice: number | null;
  arv: number | null;
  priority: string;
};

export function scoreLead(lead: ScoredLead): number {
  let score = 0;

  // Motivation (0-30 pts)
  const motivation = (lead.motivation || "").toLowerCase();
  if (motivation.includes("foreclos") || motivation.includes("behind") || motivation.includes("payment")) score += 30;
  else if (motivation.includes("divorce") || motivation.includes("inherit") || motivation.includes("estate")) score += 25;
  else if (motivation.includes("relocat") || motivation.includes("moving")) score += 20;
  else if (motivation.includes("repair") || motivation.includes("fix") || motivation.includes("condition")) score += 15;
  else if (motivation) score += 10;

  // Timeline (0-25 pts)
  const timeline = lead.timeline || "";
  if (timeline === "ASAP") score += 25;
  else if (timeline === "1-2 weeks") score += 20;
  else if (timeline === "30 days") score += 15;
  else if (timeline === "60-90 days") score += 8;
  else if (timeline === "Flexible") score += 3;

  // Condition (0-20 pts)
  const condition = lead.condition || "";
  if (condition === "Poor / Needs Work" || condition === "Teardown") score += 20;
  else if (condition === "Fair") score += 15;
  else if (condition === "Good") score += 8;
  else if (condition === "Excellent") score += 3;

  // Price gap vs ARV (0-25 pts)
  if (lead.askingPrice && lead.arv) {
    const maxOffer = lead.arv * 0.7;
    if (lead.askingPrice <= maxOffer) score += 25;
    else if (lead.askingPrice <= maxOffer * 1.1) score += 15;
    else if (lead.askingPrice <= maxOffer * 1.2) score += 8;
  }

  return Math.min(score, 100);
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Hot", color: "bg-red-100 text-red-700" };
  if (score >= 45) return { label: "Warm", color: "bg-orange-100 text-orange-700" };
  if (score >= 20) return { label: "Cool", color: "bg-blue-100 text-blue-700" };
  return { label: "Cold", color: "bg-gray-100 text-gray-500" };
}
